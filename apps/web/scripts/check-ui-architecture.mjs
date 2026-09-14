import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");
const entryFiles = new Set([
  path.join(root, "App.tsx"),
  path.join(root, "main.tsx"),
]);
const errors = [];

function visitFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "test" ? [] : visitFiles(target);
    }
    return /\.[jt]sx?$/.test(entry.name) &&
      !/\.(test|spec)\.[jt]sx?$/.test(entry.name)
      ? [target]
      : [];
  });
}

for (const file of visitFiles(root)) {
  const sourceText = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const uiComponents = new Set();
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      if (
        statement.moduleSpecifier.text === "@retzetar/ui" &&
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings)
      ) {
        for (const element of statement.importClause.namedBindings.elements) {
          uiComponents.add(element.name.text);
        }
      }

      if (
        statement.moduleSpecifier.text.endsWith(".css") &&
        (file !== path.join(root, "main.tsx") ||
          statement.moduleSpecifier.text !== "@retzetar/ui/styles.css")
      ) {
        const { line, character } = source.getLineAndCharacterOfPosition(
          statement.getStart(source),
        );
        errors.push(
          `${file}:${line + 1}:${character + 1} CSS may only be imported from @retzetar/ui/styles.css in main.tsx`,
        );
      }
    }
  }

  function inspect(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ts.isIdentifier(node.tagName)
    ) {
      const { line, character } = source.getLineAndCharacterOfPosition(
        node.tagName.getStart(source),
      );
      const hasClassName = node.attributes.properties.some(
        (attribute) =>
          ts.isJsxAttribute(attribute) && attribute.name.text === "className",
      );
      const nativeElement = /^[a-z]/.test(node.tagName.text);

      if (hasClassName && nativeElement) {
        errors.push(
          `${file}:${line + 1}:${character + 1} className is forbidden on native <${node.tagName.text}>; use an @retzetar/ui primitive`,
        );
      } else if (hasClassName && !uiComponents.has(node.tagName.text)) {
        errors.push(
          `${file}:${line + 1}:${character + 1} className may only extend a component imported from @retzetar/ui`,
        );
      }

      if (nativeElement && !entryFiles.has(file)) {
        errors.push(
          `${file}:${line + 1}:${character + 1} native <${node.tagName.text}> JSX is forbidden outside @retzetar/ui`,
        );
      }
    }
    ts.forEachChild(node, inspect);
  }

  inspect(source);
}

const mainSource = fs.readFileSync(path.join(root, "main.tsx"), "utf8");
if (!mainSource.includes('import "@retzetar/ui/styles.css"')) {
  errors.push("src/main.tsx must import @retzetar/ui/styles.css exactly once");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("UI architecture guard passed.");
}
