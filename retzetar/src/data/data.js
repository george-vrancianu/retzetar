const data = {
  recipes: [
    {
      id: 'carbonara',
      name: 'Paste Carbonara',
      recipeIngredients: [
        {
          ingredients: [{
            id: 'guanciale',
            cant: 100
          }, {
            id: 'parmezan',
            cant: 100
          }, {
            id: 'oua',
            cant: 2
          }, {
            id: 'paste',
            cant: 120
          }]
        }
      ],
      recipeInstructions: {
        text: 'blabla'
      }
    }
  ],
  ingredients: [
    {
      id: 'guanciale',
      name: 'Guanciale',
      umId: 'mg'
    }, {
      id: 'parmezan',
      name: 'Parmezan',
      umId: 'mg'
    }, {
      id: 'oua',
      name: 'Oua',
      umId: 'buc'
    }, {
      id: 'paste',
      name: 'Paste',
      umId: 'mg'
    }, {
      id: 'usturoi',
      name: 'Usturoi',
      umId: 'catei'
    }, {
      id: 'peperoncino',
      name: 'Peperoncino',
      umId: 'mg'
    }
  ],
  um: [
    { id: 'mg', name: 'MG.' },
    { id: 'ml', name: 'ML.' },
    { id: 'buc', name: 'Buc.' },
    { id: 'catei', name: 'Catei' }
  ]
}

export const mapRecipes = ({ recipes, ingredients, um }) => {
  ingredients = ingredients.map(ingredient => ({
    ...ingredient,
    um: um.find(umObject => umObject.id === ingredient.umId)
  }))

  return recipes.map(recipe => ({
    ...recipe,
    recipeIngredients: recipe.recipeIngredients.map(ingredient => ({
      ...ingredient,
      ingredient: ingredients.find(ingredientObject => ingredientObject.id === ingredient.id)
    }))
  }))
}

export const getRecipes = () => {
  return mapRecipes(data)
}

export default data
