import { useContext } from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="11" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="15" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7l1-3h14l1 3M4 7h16M4 7v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  promo: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.59 13.41 12 22l-9-9V4a1 1 0 0 1 1-1h9l7.59 7.59a2 2 0 0 1 0 2.82Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  staff: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const Sidebar = () => {
  const { isSuperAdmin } = useContext(StoreContext);

  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        {isSuperAdmin && (
          <NavLink to='dashboard' className="sidebar-option">
            <span className="sidebar-icon">{icons.dashboard}</span>
            <p>Dashboard</p>
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to='add' className="sidebar-option">
            <span className="sidebar-icon">{icons.add}</span>
            <p>Add Items</p>
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to='list' className="sidebar-option">
            <span className="sidebar-icon">{icons.list}</span>
            <p>List Items</p>
          </NavLink>
        )}
        <NavLink to='orders' className="sidebar-option">
          <span className="sidebar-icon">{icons.orders}</span>
          <p>Orders</p>
        </NavLink>
        {isSuperAdmin && (
          <NavLink to='promos' className="sidebar-option">
            <span className="sidebar-icon">{icons.promo}</span>
            <p>Promo Codes</p>
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to='staff' className="sidebar-option">
            <span className="sidebar-icon">{icons.staff}</span>
            <p>Staff</p>
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to='activity' className="sidebar-option">
            <span className="sidebar-icon">{icons.activity}</span>
            <p>Activity Log</p>
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default Sidebar
