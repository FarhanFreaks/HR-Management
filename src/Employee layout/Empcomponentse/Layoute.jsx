import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebare';
import './Layoute.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employee': 'Employee',
  '/leave': 'Leave',
  '/recruitment': 'Recruitment',
  '/login-info': 'Login Information',
};

export default function Layoute() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'HRConnect';

  return (
    <div className="app-layout">
      <Sidebar/>
      <div className="main-content">
        <header className="page-header">
          <h1 className="page-title">{title}</h1>
        
        </header>
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
