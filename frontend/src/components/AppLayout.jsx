import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="app-shell d-flex w-100 text-start">
      <Sidebar />
      <main className="app-main d-flex flex-column">
        <Outlet />
      </main>
    </div>
  );
}
