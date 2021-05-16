import { Link } from 'react-router-dom'
import React from 'react'

const NavMenu = (props) => {
  return <nav>
    <ul>
      <li>
        <Link to="/">Recipes</Link>
      </li>
      <li>
        <Link to="/cart">Cart</Link>
      </li>
      <li>
        <Link to="/config">Config</Link>
      </li>
    </ul>
  </nav>
}

export default NavMenu
