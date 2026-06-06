import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

const pageTitles = {
  '/dashboard': 'Overview',
  '/employee': 'Employee Details',
  '/attendance': 'Attendance',
  '/payroll': 'Payroll',
  '/leave': 'Leave',
  '/recruitment': 'Recruitment',
  '/login-info': 'Login Information',
};

export default function Layout() {
  const location = useLocation();
  let title = pageTitles[location.pathname];
  if (location.pathname.startsWith('/employee/')) {
    title = 'Employee Profile';
  } else if (title === undefined) {
    title = 'HRConnect';
  }

  return (
    <div className="app-layout">
      <Sidebar />
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
