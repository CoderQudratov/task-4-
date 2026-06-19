import { useEffect, useState } from "react";
import { getUsers } from "../api/users";
import type { User } from "../types/user";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Toolbar from "../components/Toolbar";
import UserTable from "../components/UserTable";

function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setError("");
    } catch {
      setError("Failed to load users. Please refresh the page.");
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (initialLoad) return <Loader />;

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="container-fluid px-2 px-md-4 py-2 py-md-0">
      {/* Page header */}
      <div className="py-3 mb-1 border-bottom">
        <h5 className="mb-0 fw-semibold">Users</h5>
      </div>

      <Toolbar
        selectedIds={selectedIds}
        onActionComplete={fetchUsers}
        onClearSelection={() => setSelectedIds([])}
      />

      <UserTable
        users={users}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
    </>
  );
}

export default Dashboard;
