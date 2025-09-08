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


const Users = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState(new Set());
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/requests/pending");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("loadRequests:", err);
      showMsg("Failed to load pending requests", "error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const setBusy = (id, on) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const approve = async (id) => {
    if (!id) return;
    try {
      setBusy(id, true);
      await api.put(`/requests/approve/${id}`);
      setRequests((prev) => prev.filter((r) => (r.id ?? r._id) !== id));
      showMsg("Approved");
    } catch (err) {
      console.error("approve:", err);
      showMsg("Approve failed", "error");
    } finally {
      setBusy(id, false);
    }
  };

  const reject = async (id) => {
    if (!id) return;
    try {
      setBusy(id, true);
      await api.delete(`/requests/${id}`);
      setRequests((prev) => prev.filter((r) => (r.id ?? r._id) !== id));
      showMsg("Rejected");
    } catch (err) {
      console.error("reject:", err);
      showMsg("Reject failed", "error");
    } finally {
      setBusy(id, false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-3">Pending Requests</h3>

      {msg && (
        <div className={`alert ${msg.type === "error" ? "alert-danger" : "alert-success"}`}>
          {msg.text}
        </div>
      )}

      {loading ? <p>Loading...</p> : null}

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Group</th>
            <th>Note</th> {/* changed header to Note */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 && !loading ? (
            <tr><td colSpan={5} className="text-center">No pending requests.</td></tr>
          ) : (
            requests.map((r, i) => {
              const id = r.id ?? r._id ?? i;

              // Use user.name (your DB uses "name"), fallback to other common fields
              const username =
                r.user?.name ??
                r.user?.username ??
                r.username ??
                "—";

              const group = r.group?.name ?? r.group?.groupname ?? r.group ?? "—";

              // show the note text — check common field names
              const note = r.note ?? r.message ?? r.requestNote ?? "—";

              const busy = busyIds.has(id);

              return (
                <tr key={id}>
                  <td>{i + 1}</td>
                  <td>{username}</td>
                  <td>{group}</td>
                  <td>{note}</td> {/* now shows note */}
                  <td>
                    <button className="btn btn-sm btn-success me-2" onClick={() => approve(id)} disabled={busy}>
                      {busy ? "..." : "Approve"}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => reject(id)} disabled={busy}>
                      {busy ? "..." : "Reject"}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
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
  const [editingGroup, setEditingGroup] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;
  const DARK_BLUE = "#0B3D91";

  const getId = (item) => item?.id ?? item?._id ?? item?.groupId ?? item?.uuid ?? item?.subGroupId ?? item?.sub_group_id ?? null;

  useEffect(() => {
    let mounted = true;
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/admin/groups");
        const data = res.data?.groups ?? res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setGroups(arr);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || "Failed to fetch groups");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGroups();
    return () => { mounted = false; };
  }, []);

  const indexOfLast = currentPage * groupsPerPage;
  const indexOfFirst = indexOfLast - groupsPerPage;
  const currentGroups = groups.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(groups.length / groupsPerPage));

  const handleDelete = async (group) => {
    const id = getId(group);
    if (!id) { alert("Cannot delete: group id missing"); return; }
    if (!window.confirm("Delete this group?")) return;
    try {
      await api.delete(`/admin/groups/${id}`);
      setGroups((prev) => prev.filter((g) => getId(g) !== id));
      if ((groups.length - 1) <= indexOfFirst && currentPage > 1) setCurrentPage((p) => p - 1);
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Create (POST) — include id where present (new subgroups will have id: null)
  const handleCreate = async (payload) => {
    setCreateError(null);
    for (let i = 0; i < (payload.subGroups || []).length; i++) {
      const sg = payload.subGroups[i];
      if (!sg.name || !sg.path) {
        setCreateError(`SubGroup ${i + 1} requires name and path.`);
        return;
      }
    }
    const backendPayload = {
      groupname: payload.name,
      source_path: payload.path,
      description: payload.description,
      subGroups: (payload.subGroups || []).map((sg) => ({
        // include id if present (null/undefined for newly added ones)
        id: sg.id ?? null,
        subGroupname: sg.name,
        source_path: sg.path,
        description: sg.description,
      })),
    };
    try {
      const res = await api.post("/admin/groups", backendPayload);
      const created = res.data?.group ?? res.data?.data ?? res.data;
      if (!created) { setCreateError("Unexpected create response"); return; }
      setGroups((prev) => [created, ...prev]);
      setShowModal(false);
      setSubGroups([]);
      setEditingGroup(null);
      setCurrentPage(1);
    } catch (err) {
      setCreateError(err.response?.data?.message || (err.response?.data && JSON.stringify(err.response.data)) || err.message || "Create failed");
    }
  };

  // Update (PUT) — include id for subgroups so backend can update not delete
  const handleUpdate = async (id, payload) => {
    setCreateError(null);
    const backendPayload = {
      groupname: payload.name,
      source_path: payload.path,
      description: payload.description,
      subGroups: (payload.subGroups || []).map((sg) => ({
        id: sg.id ?? null,                 // <-- important: preserve existing subgroup ids
        subGroupname: sg.name,
        source_path: sg.path,
        description: sg.description,
      })),
    };
    try {
      const res = await api.put(`/admin/groups/${id}`, backendPayload);
      // prefer server-returned object, fallback to constructed object
      const updated = res.data?.group ?? res.data?.data ?? res.data ?? { id, ...backendPayload };
      setGroups((prev) => prev.map((g) => (getId(g) === id ? updated : g)));
      setShowModal(false);
      setSubGroups([]);
      setEditingGroup(null);
    } catch (err) {
      setCreateError(err.response?.data?.message || (err.response?.data && JSON.stringify(err.response.data)) || err.message || "Update failed");
    }
  };

  // On Edit: prefill modal using subgroup id + subGroupname (and sensible fallbacks)
  const handleEditClick = (group) => {
    setEditingGroup(group);
    const raw = group.subGroups ?? []; // assume backend returns an array
    const sg = Array.isArray(raw)
      ? raw.map((s) => ({
          id: s?.id ?? s?.subGroupId ?? s?.sub_group_id ?? s?.uuid ?? null,
          name: s?.subGroupname ?? s?.sub_groupname ?? s?.groupname ?? s?.name ?? "",
          path: s?.source_path ?? s?.path ?? s?.folderPath ?? "",
          description: s?.description ?? s?.desc ?? "",
        }))
      : [];
    setSubGroups(sg);
    setCreateError(null);
    setShowModal(true);
    setCurrentPage(1);
  };

  const handleAddSubGroup = () => setSubGroups((s) => [...s, { id: null, name: "", path: "", description: "" }]);
  const handleRemoveSubGroup = (index) => setSubGroups((prev) => prev.filter((_, i) => i !== index));
  const resetModal = () => { setSubGroups([]); setCreateError(null); setShowModal(false); setEditingGroup(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.groupName?.value?.trim() ?? "",
      path: form.folderPath?.value?.trim() ?? "",
      description: form.description?.value?.trim() ?? "",
      subGroups: subGroups.map((sg) => ({ id: sg.id ?? null, name: sg.name?.trim(), path: sg.path?.trim(), description: sg.description?.trim() })),
    };
    if (!payload.name || !payload.path) { setCreateError("Group name and folder path are required."); return; }
    if (editingGroup) {
      const id = getId(editingGroup);
      if (!id) { setCreateError("Cannot determine editing group's id."); return; }
      handleUpdate(id, payload);
    } else handleCreate(payload);
  };

  const renderName = (group) => group?.groupname ?? group?.name ?? "—";
  const renderPath = (group) => group?.source_path ?? group?.path ?? "—";
  const renderDescription = (group) => group?.description ?? "—";

  return (
    <div className="container mt-4">
      <style>{`
        .thead-deep-blue th { background-color: ${DARK_BLUE}; color: #fff; }
        .modal-backdrop-fake{ position: fixed; inset:0; background: rgba(0,0,0,0.4); z-index:1040; }
        .modal.d-block { z-index:1045; }
        td.ellipsis { max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .subgroup-indent { padding-left: 2.25rem; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Groups Management</h4>
        <button className="btn btn-primary" onClick={() => { setEditingGroup(null); setSubGroups([]); setCreateError(null); setShowModal(true); }}>
          <FaPlus className="me-2" /> Create Group
        </button>
      </div>

      {loading && <p>Loading groups...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      <table className="table table-hover">
        <thead className="thead-deep-blue">
          <tr><th>Groups</th><th>Folder Path</th><th>Description</th><th style={{ width: 180 }}>Actions</th></tr>
        </thead>
        <tbody>
          {currentGroups.length === 0 && !loading ? (
            <tr><td colSpan={4} className="text-center">No groups found.</td></tr>
          ) : (
            currentGroups.map((group) => {
              const gid = getId(group) ?? Math.random();
              return (
                <React.Fragment key={gid}>
                  <tr className="fw-bold">
                    <td>{renderName(group)}</td>
                    <td className="ellipsis" title={renderPath(group)}>{renderPath(group)}</td>
                    <td>{renderDescription(group)}</td>
                    <td>
                      <button className="btn btn-sm btn-success me-2" onClick={() => handleEditClick(group)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(group)}>Delete</button>
                    </td>
                  </tr>

                  {(group.subGroups || []).map((sub, idx) => {
                    const sid = getId(sub) ?? `${gid}-sub-${idx}`;
                    return (
                      <tr key={sid}>
                        <td className="subgroup-indent">{sub?.subGroupname ?? sub?.sub_groupname ?? sub?.groupname ?? sub?.name ?? "—"}</td>
                        <td className="ellipsis" title={sub?.source_path ?? sub?.path ?? ""}>{sub?.source_path ?? sub?.path ?? ""}</td>
                        <td>{sub?.description ?? sub?.desc ?? ""}</td>
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
          <div className="modal d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">{editingGroup ? "Edit Group" : "Create New Group"}</h5>
                    <button type="button" className="btn-close" onClick={resetModal} />
                  </div>
                  <div className="modal-body">
                    {createError && <div className="alert alert-danger">{createError}</div>}

                    <div className="mb-3">
                      <label className="form-label">Group Name *</label>
                      <input type="text" name="groupName" className="form-control" required defaultValue={editingGroup ? (editingGroup.groupname ?? editingGroup.name ?? "") : ""} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Folder Path *</label>
                      <input type="text" name="folderPath" className="form-control" required defaultValue={editingGroup ? (editingGroup.source_path ?? editingGroup.path ?? "") : ""} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea name="description" className="form-control" rows="2" required defaultValue={editingGroup ? (editingGroup.description ?? editingGroup.desc ?? "") : ""} />
                    </div>

                    <div className="mb-3">
                      <button className="btn btn-outline-primary" type="button" onClick={handleAddSubGroup}>+ Add SubGroup</button>
                    </div>

                    {subGroups.map((sub, index) => (
                      <div key={index} className="mb-4 border p-3 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">SubGroup {index + 1}</h6>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveSubGroup(index)}><FaTrash className="me-1" /> Remove</button>
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Name *</label>
                          <input type="text" className="form-control" required value={sub.name} onChange={(e) => setSubGroups(prev => prev.map((sg,i) => i===index ? {...sg, name: e.target.value} : sg))} />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Folder Path *</label>
                          <input type="text" className="form-control" required value={sub.path} onChange={(e) => setSubGroups(prev => prev.map((sg,i) => i===index ? {...sg, path: e.target.value} : sg))} />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Description *</label>
                          <textarea className="form-control" rows="2" required value={sub.description} onChange={(e) => setSubGroups(prev => prev.map((sg,i) => i===index ? {...sg, description: e.target.value} : sg))} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={resetModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editingGroup ? "Save Changes" : "Create Group"}</button>
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
