import React from 'react'
import { Link } from 'react-router-dom'

const ConfigPage = (props) => {
  return <>
      <ul>
      <li>
        <Link to="/config/ingredients">Ingredients</Link>
      </li>
      <li>
        <Link to="/config/recipes">Recipes</Link>
      </li>
    </ul>
  </>
}

export default ConfigPage
