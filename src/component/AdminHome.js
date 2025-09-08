// AdminHome.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaUsers,
  FaBell,
  FaCog,
  FaLayerGroup,
  FaClipboardList,
  FaSearch,
  FaPlus,
  FaChevronRight,
  FaChevronDown,
  FaTrash,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "./api"

/* ===========================
   === Pagination Component (inlined) ===
   =========================== */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
        <button className="page-link" onClick={() => onPageChange(i)}>
          {i}
        </button>
      </li>
    );
  }

  return (
    <nav>
      <ul className="pagination justify-content-end">{pages}</ul>
    </nav>
  );
};

/* ===========================
   === Dashboard component ===
   =========================== */
const Dashboard = () => (
  <div>
    <h5 className="mb-3 fw-bold">Key Metrics</h5>
    {/* Metrics */}
    <div className="row mb-4">
      <div className="col-md-4">
        <div className="card text-center p-3 shadow metric-card">
          <FaUsers size={28} className="mb-2 text-primary" />
          <h6>Total Users</h6>
          <h3>4</h3>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-center p-3 shadow metric-card">
          <FaClipboardList size={28} className="mb-2 text-warning" />
          <h6>Pending Requests</h6>
          <h3>3</h3>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card text-center p-3 shadow metric-card">
          <FaLayerGroup size={28} className="mb-2 text-danger" />
          <h6>Groups</h6>
          <h3>2</h3>
        </div>
      </div>
    </div>

    {/* Recent activity */}
    <div className="row">
      <div className="col-md-8">
        <h6 className="fw-bold">Recent Activity</h6>
        <ul className="list-group shadow-sm">
          <li className="list-group-item">
            <strong>user123</strong> – Requested access to Wealth group <br />
            <small>2 minutes ago</small>
          </li>
          <li className="list-group-item">
            <strong>client456</strong> – Updated profile information <br />
            <small>15 minutes ago</small>
          </li>
          <li className="list-group-item">
            <strong>admin789</strong> – Approved compliance request <br />
            <small>1 hour ago</small>
          </li>
          <li className="list-group-item">
            <strong>user234</strong> – Joined Risk Management group <br />
            <small>3 hours ago</small>
          </li>
        </ul>
      </div>
      <div className="col-md-4">
        <h6 className="fw-bold">Notification</h6>
        <div className="card p-3 shadow-sm notification-card">
          <FaBell className="me-2 text-warning" /> New request pending approval
        </div>
      </div>
    </div>
  </div>
);

/* ===========================
   === Users subcomponent (static) ===
   =========================== */
const Users = () => {
  const requests = [
    { id: 1, name: "John Smith", group: "Wealth Management", date: "15 Aug 2025" },
    { id: 2, name: "Priya K.", group: "Investments", date: "14 Aug 2025" },
    { id: 3, name: "Arjun Mehta", group: "Client Portfolio", date: "12 Aug 2025" },
  ];

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4">User Access Request</h3>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control shadow-sm"
          placeholder="Search..."
          style={{ maxWidth: "300px" }}
        />
      </div>

      {/* Requests Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">User Name</th>
                <th>Group Requested</th>
                <th>Requested Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="px-4">{req.name}</td>
                  <td>{req.group}</td>
                  <td>{req.date}</td>
                  <td className="text-center">
                    <button className="btn btn-sm text-white me-2" style={{ backgroundColor: "#7b61ff" }}>
                      Approve
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve All Button */}
      <div className="text-center mt-4">
        <button className="btn text-white px-4 py-2" style={{ backgroundColor: "#7b61ff" }}>
          Approve All
        </button>
      </div>
    </div>
  );
};

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [subGroups, setSubGroups] = useState([]);
  const [createError, setCreateError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 3;
  const DARK_BLUE = "#0B3D91";

  // helper to get id regardless of backend field name
  const getId = (item) => item?.id ?? item?._id ?? item?.groupId ?? item?.uuid;

  // === Fetch groups on mount ===
  useEffect(() => {
    let mounted = true;
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/admin/groups");
        // tolerate different response shapes
        const data = res.data?.groups ?? res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setGroups(arr);

        // log one example so you can inspect exact keys in console
        console.log("Loaded groups (example):", arr[0] ?? "(no groups)");
      } catch (err) {
        console.error("Fetch groups error:", err);
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || "Failed to fetch groups");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGroups();
    return () => {
      mounted = false;
    };
  }, []);

  // === Pagination calculations ===
  const indexOfLast = currentPage * groupsPerPage;
  const indexOfFirst = indexOfLast - groupsPerPage;
  const currentGroups = groups.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(groups.length / groupsPerPage));

  // === Delete group ===
  const handleDelete = async (group) => {
    const id = getId(group);
    if (!id) {
      alert("Cannot delete: group id missing");
      return;
    }
    if (!window.confirm("Delete this group?")) return;
    try {
      await api.delete(`/admin/groups/${id}`);
      setGroups((prev) => prev.filter((g) => getId(g) !== id));
      // adjust page if needed
      if ((groups.length - 1) <= indexOfFirst && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  // === Create group (send backend-expected keys: groupname & source_path) ===
  const handleCreate = async (payload) => {
    setCreateError(null);
    // basic validation for subgroup entries
    for (let i = 0; i < (payload.subGroups || []).length; i++) {
      const sg = payload.subGroups[i];
      if (!sg.name || !sg.path) {
        setCreateError(`SubGroup ${i + 1} requires name and path.`);
        return;
      }
    }

    // Build payload matching backend field names
    const backendPayload = {
      groupname: payload.name,
      source_path: payload.path,
      description: payload.description,
      subGroups: (payload.subGroups || []).map((sg) => ({
        subGroupname: sg.name,
        source_path: sg.path,
        description: sg.description,
      })),
    };

    try {
      const res = await api.post("/admin/groups", backendPayload);
      // tolerate response shapes
      const created = res.data?.group ?? res.data?.data ?? res.data;
      if (!created) {
        setCreateError("Unexpected create response from server");
        console.error("Create response:", res.data);
        return;
      }
      // prepend created group to UI
      setGroups((prev) => [created, ...prev]);
      setShowModal(false);
      setSubGroups([]);
      setCurrentPage(1); // show first page so user sees new group
    } catch (err) {
      console.error("Create group error:", err);
      setCreateError(err.response?.data?.message || err.message || "Create failed");
    }
  };

  // modal helpers
  const handleAddSubGroup = () => setSubGroups((s) => [...s, { name: "", path: "", description: "" }]);
  const handleRemoveSubGroup = (index) => setSubGroups((prev) => prev.filter((_, i) => i !== index));
  const resetModal = () => {
    setSubGroups([]);
    setCreateError(null);
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.groupName?.value?.trim() ?? form.groupname?.value?.trim() ?? "",
      path: form.folderPath?.value?.trim() ?? form.source_path?.value?.trim() ?? "",
      description: form.description?.value?.trim() ?? "",
      subGroups: subGroups.map((sg) => ({
        name: sg.name?.trim(),
        path: sg.path?.trim(),
        description: sg.description?.trim(),
      })),
    };
    if (!payload.name || !payload.path) {
      setCreateError("Group name and folder path are required.");
      return;
    }
    handleCreate(payload);
  };

  // helper to render according to backend naming
  const renderName = (group) => group?.groupname ?? group?.name ?? group?.groupName ?? "—";
  const renderPath = (group) => group?.source_path ?? group?.path ?? group?.folderPath ?? "—";
  const renderDescription = (group) => group?.description ?? group?.desc ?? "—";

  return (
    <div className="container mt-2">
      <style>{`
        .thead-deep-blue th {
          background-color: ${DARK_BLUE};
          color: #fff;
        }
        /* ensure modal backdrop-like feel */
        .modal-backdrop-fake{
          position: fixed; inset:0; background: rgba(0,0,0,0.4); z-index:1040;
        }
        .modal.d-block { z-index:1045; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Groups Management</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Create Group
        </button>
      </div>

      {loading && <p>Loading groups...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      <table className="table table-hover">
        <thead className="thead-deep-blue">
          <tr>
            <th>Groups</th>
            <th>Folder Path</th>
            <th>Description</th>
            <th style={{ width: 180 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentGroups.length === 0 && !loading ? (
            <tr>
              <td colSpan={4} className="text-center">
                No groups found.
              </td>
            </tr>
          ) : (
            currentGroups.map((group) => {
              const gid = getId(group);
              return (
                <React.Fragment key={gid ?? Math.random()}>
                  <tr className="fw-bold">
                    <td>{renderName(group)}</td>
                    <td>{renderPath(group)}</td>
                    <td>{renderDescription(group)}</td>
                    <td>
                      {/* Edit is a placeholder; can implement PUT flow later */}
                      <button className="btn btn-sm btn-success me-2">Edit</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(group)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {(group.subGroups || []).map((sub) => {
                    const sid = getId(sub);
                    return (
                      <tr key={sid ?? Math.random()}>
                        <td className="ps-5">
                          {sub?.groupname ?? sub?.subGroupname ?? "—"}
                        </td>
                        <td>{sub?.source_path ?? sub?.path ?? sub?.folderPath ?? "—"}</td>
                        <td>{sub?.description ?? sub?.desc ?? "—"}</td>
                        <td></td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Create New Group</h5>
                    <button type="button" className="btn-close" onClick={resetModal} />
                  </div>
                  <div className="modal-body">
                    {createError && <div className="alert alert-danger">{createError}</div>}
                    <div className="mb-3">
                      <label className="form-label">Group Name *</label>
                      {/* keep user-friendly input names; we map to backend field names in handleCreate */}
                      <input type="text" name="groupName" className="form-control" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Folder Path *</label>
                      <input type="text" name="folderPath" className="form-control" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea name="description" className="form-control" rows="2" required />
                    </div>

                    <div className="mb-3">
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={handleAddSubGroup}
                      >
                        + Add SubGroup
                      </button>
                    </div>

                    {subGroups.map((sub, index) => (
                      <div key={index} className="mb-4 border p-3 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">SubGroup {index + 1}</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveSubGroup(index)}
                          >
                            <FaTrash className="me-1" /> Remove
                          </button>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={sub.name}
                            onChange={(e) =>
                              setSubGroups((prev) =>
                                prev.map((sg, i) => (i === index ? { ...sg, name: e.target.value } : sg))
                              )
                            }
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Folder Path *</label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={sub.path}
                            onChange={(e) =>
                              setSubGroups((prev) =>
                                prev.map((sg, i) => (i === index ? { ...sg, path: e.target.value } : sg))
                              )
                            }
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Description *</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            required
                            value={sub.description}
                            onChange={(e) =>
                              setSubGroups((prev) =>
                                prev.map((sg, i) => (i === index ? { ...sg, description: e.target.value } : sg))
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={resetModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Create Group</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop-fake" onClick={resetModal} />
        </>
      )}
    </div>
  );
};

/* ===========================
   === ApprovedRequests component (unchanged) ===
   =========================== */
const ApprovedRequests = () => {
  // local styles (same dark blue for header + button)
  const DARK_BLUE = "#0B3D91";
  const DARK_BLUE_HOVER = "#0A357F";

  const [requests, setRequests] = useState([
    { id: 1, username: "Alice", group: "Wealth", subgroup: "Wealth India" },
    { id: 2, username: "Bob", group: "Wealth", subgroup: "Wealth Global" },
    { id: 3, username: "Charlie", group: "Health", subgroup: "Health Plus" },
    { id: 4, username: "David", group: "Finance", subgroup: "Finance Core" },
    { id: 5, username: "Eve", group: "Finance", subgroup: "Finance Global" },
    { id: 6, username: "Frank", group: "Tech", subgroup: "AI Group" },
    { id: 7, username: "Eva White", group: "Tech", subgroup: "Tech AI" },
    { id: 8, username: "Frank Black", group: "Finance", subgroup: "Finance Africa" },
    { id: 9, username: "Grace King", group: "Wealth", subgroup: "Wealth Europe" },
    { id: 10, username: "Henry Hall", group: "Tech", subgroup: "Tech Security" },
    { id: 11, username: "Frank", group: "Tech", subgroup: "AI Group" },
    { id: 12, username: "Eva White", group: "Tech", subgroup: "Tech AI" },
    { id: 13, username: "Frank Black", group: "Finance", subgroup: "Finance Africa" },
    { id: 14, username: "Grace King", group: "Wealth", subgroup: "Wealth Europe" },
    { id: 15, username: "Henry Hall", group: "Tech", subgroup: "Tech Security" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const handleRemove = (id) => {
    setRequests(requests.filter((req) => req.id !== id));
  };

  return (
    <div className="container mt-1">
      <style>{`
        .thead-deep-blue th {
          background-color: ${DARK_BLUE};
          color: #ffffff;
        }
        .btn-deep-blue {
          background-color: ${DARK_BLUE};
          border: none;
          color: #ffffff;
        }
        .btn-deep-blue:hover {
          background-color: ${DARK_BLUE_HOVER};
          color: #ffffff;
        }
      `}</style>

      <h4 className="fw-bold mb-3">Approved Requests</h4>

      <div className="table-responsive">
        {/* Use plain .table (no .table-bordered) to avoid vertical lines */}
        <table className="table table-hover">
          <thead className="thead-deep-blue">
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Group</th>
              <th>Subgroup</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((req, index) => (
              <tr key={req.id}>
                <td>{indexOfFirst + index + 1}</td>
                <td>{req.username}</td>
                <td>{req.group}</td>
                <td>{req.subgroup}</td>
                <td>
                  <button className="btn btn-sm btn-deep-blue" onClick={() => handleRemove(req.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

// AdminProfile subcomponent
const AdminProfile = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-2">Admin Profile</h2>
      <p className="text-muted mb-4">Manage your account settings and preferences.</p>

      <div className="row">
        {/* Profile Info Section */}
        <div className="col-md-8">
          <div className="card p-4 mb-4 shadow-sm">
            <div className="d-flex align-items-center mb-4">
              <div className="admin-avatar me-3">
                <FaUser />
              </div>
              <div>
                <h5 className="mb-1">John Doe</h5>
                <small className="text-muted">admin@domain.com</small>
              </div>
            </div>

            <form>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value="John Doe" readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value="admin@domain.com" readOnly />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-control" value="System Administrator" readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" value="IT Security" readOnly />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-control" value="+1 (555) 123-4567" readOnly />
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary">Edit</button>
                <button type="button" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="col-md-4">
          <div className="card p-4 shadow-sm">
            <h5 className="mb-3">Change Password</h5>
            <form>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" />
              </div>
              <button type="submit" className="btn btn-success w-100">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Main AdminHome Component ===
const AdminHome = () => {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <>
      <style>{`
        .sidebar {
          min-height: 100vh;
          width: 220px;
          background-color: #053bffff;
        }
        .sidebar .nav-link {
          color: #ffffffff;
          padding: 10px 15px;
          border-radius: 4px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .sidebar .nav-link:hover {
          background-color: rgba(255,255,255,0.2);
          color: rgb(46, 0, 155) !important;
          transform: translateX(5px);
        }
        .topbar {
          background-color: #fff;
          border-bottom: 1px solid #ddd;
          padding: 15px 20px;
          font-size: 1.2rem;
        }
        .metric-card {
          background-color: #f8f9fa;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .metric-card:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .notification-card {
          background-color: #fff;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .groups-page h2 {
          margin-bottom: 20px;
        }
        .create-group, .existing-groups {
          background: white;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .create-group input {
          display: block;
          width: 100%;
          margin-bottom: 12px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .create-group button {
          background: #7b61ff;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        .existing-groups table {
          width: 100%;
          border-collapse: collapse;
        }
        .existing-groups th, .existing-groups td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        .delete-btn {
          background: white;
          color: black;
          border: 1px solid black;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .delete-btn:hover {
          background: #333;
          color: white;
          border-color: #333;
        }
        .edit-btn {
          background: #7b61ff;
          color: white;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 4px;
        }

        /* === Admin Profile Styles (integrated) === */
        .admin-avatar {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: #7b61ff; /* Purple background */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        .card {
          border: none;
          border-radius: 10px;
        }
        .btn-primary {
          background-color: #7b61ff;
          border: none;
        }
        .btn-primary:hover {
          background-color: #5a48cc;
        }
        .btn-success {
          background-color: #7b61ff;
          border: none;
        }
        .btn-success:hover {
          background-color: #5a48cc;
        }
        .btn-secondary {
          background-color: #6c757d;
          border: none;
        }
        .btn-secondary:hover {
          background-color: #565e64;
        }

        .path-cell {
          max-width: 320px;         /* adjust width as needed */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: monospace;   /* optional: nicer for file paths */
        }

        .path-cell--wrap {
          white-space: normal;      /* if you want to allow wrapping instead */
          word-break: break-all;
        }

      `}</style>

      <div className="d-flex">
        {/* Sidebar */}
        <div className="p-3 vh-100 sidebar">
          <h4 className="mb-4 text-white">Logo</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2 nav-link sidebar-link" onClick={() => setActivePage("dashboard")}>
              <FaLayerGroup className="me-2" /> Dashboard
            </li>
            <li className="nav-item mb-2 nav-link sidebar-link" onClick={() => setActivePage("users")}>
              <FaUsers className="me-2" /> User Management
            </li>
            <li className="nav-item mb-2 nav-link sidebar-link" onClick={() => setActivePage("groups")}>
              <FaUser className="me-2" /> Groups
            </li>
            <li className="nav-item mb-2 nav-link sidebar-link" onClick={() => setActivePage("approved")}>
              <FaClipboardList className="me-2" /> Approved Requests
            </li>
            <li className="nav-item mb-2 nav-link sidebar-link" onClick={() => setActivePage("profile")}>
              <FaCog className="me-2" /> Admin Profile
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1" style={{ backgroundColor: "#f8f9fa" }}>
          {/* Topbar */}
          <div className="d-flex justify-content-between align-items-center border-bottom px-4 py-4 bg-white topbar">
            <h5 className="m-0 fw-bold fs-4">Admin Dashboard</h5>
            <div>
              <FaSearch className="me-3" size={22} />
              <FaBell className="me-3" size={22} />
            </div>
          </div>

          {/* Dynamic Page Content */}
          <div className="p-4">
            {activePage === "dashboard" && <Dashboard />}
            {activePage === "users" && <Users />}
            {activePage === "groups" && <Groups />}
            {activePage === "approved" && <ApprovedRequests />}
            {activePage === "profile" && <AdminProfile />}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHome;
