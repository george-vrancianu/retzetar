import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import { getRecipes } from './data/data'
import ConfigPage from './pages/Config/ConfigPage'
import RecipesPage from './pages/Recipes/RecipesPage'
import NavMenu from './components/Menu/Menu'
import CartPage from './pages/Cart/CartPage'
import { Container } from '@material-ui/core'
import IngredientsConfig from './pages/IngredientsConfig/IngredientsConfig'
import RecipesConfigPage from './pages/RecipesConfig/RecipesConfigPage'

export default function App () {
  return (
      <Router>
        <div>
          <Container fixed>
            <NavMenu />
            <Switch>
              <Route path="/config">
                <ConfigPage />
                <Switch>
                  <Route path="/config/ingredients">
                    <IngredientsConfig />
                  </Route>
                  <Route path="/config/recipes">
                    <RecipesConfigPage />
                  </Route>
                </Switch>
              </Route>
              <Route path="/cart">
                <CartPage />
              </Route>
              <Route path="/">
                <RecipesPage />
              </Route>
            </Switch>
          </Container>
        </div>
      </Router>
  )
}
