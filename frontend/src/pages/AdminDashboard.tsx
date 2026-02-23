`typescript
// @ts-nocheck`;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Check, X, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Artisan, WorkerSubmission, ArtisanCreate } from "../types";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface ArtisanFormData extends ArtisanCreate {}

const AdminDashboard: React.FC = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [showArtisanModal, setShowArtisanModal] = useState<boolean>(false);
  const [editingArtisan, setEditingArtisan] = useState<Artisan | null>(null);
  const [artisanForm, setArtisanForm] = useState<ArtisanFormData>({
    name: "",
    phone: "",
    location: "",
    job_type: "",
    photo_url: "",
    photoFile: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchArtisans();
    fetchSubmissions();
    fetchJobTypes();
  }, [navigate]);

  const fetchArtisans = async () => {
    try {
      const response = await axios.get<Artisan[]>(`${API}/artisans`);
      setArtisans(response.data);
    } catch (error) {
      console.error("Error fetching artisans:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await axios.get<WorkerSubmission[]>(
        `${API}/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const response = await axios.get<{ job_types: string[] }>(
        `${API}/job-types`,
      );
      setJobTypes(response.data.job_types);
    } catch (error) {
      console.error("Error fetching job types:", error);
    }
  };

  const handleCreateArtisan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !artisanForm.name ||
      !artisanForm.phone ||
      !artisanForm.location ||
      !artisanForm.job_type
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const data = new FormData();
      data.append("name", artisanForm.name);
      data.append("phone", artisanForm.phone);
      data.append("location", artisanForm.location);
      data.append("job_type", artisanForm.job_type);
      if (artisanForm.photoFile) data.append("photo", artisanForm.photoFile);
      else if (artisanForm.photo_url)
        data.append("photo_url", artisanForm.photo_url);

      if (editingArtisan) {
        await axios.put(`${API}/artisans/${editingArtisan.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Artisan updated successfully");
      } else {
        await axios.post(`${API}/artisans`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Artisan created successfully");
      }

      setShowArtisanModal(false);
      setEditingArtisan(null);
      setArtisanForm({
        name: "",
        phone: "",
        location: "",
        job_type: "",
        photo_url: "",
        photoFile: null,
      });
      fetchArtisans();
    } catch (error) {
      console.error("Error saving artisan:", error);
      toast.error("Failed to save artisan");
    }
  };

  const handleEditArtisan = (artisan: Artisan) => {
    setEditingArtisan(artisan);
    setArtisanForm({
      name: artisan.name,
      phone: artisan.phone,
      location: artisan.location,
      job_type: artisan.job_type,
      photo_url: artisan.photo_url || "",
    });
    setShowArtisanModal(true);
  };

  const handleDeleteArtisan = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this artisan?"))
      return;

    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(`${API}/artisans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Artisan deleted successfully");
      fetchArtisans();
    } catch (error) {
      console.error("Error deleting artisan:", error);
      toast.error("Failed to delete artisan");
    }
  };

  const handleApproveSubmission = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `${API}/submissions/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Submission approved and artisan created");
      fetchSubmissions();
      fetchArtisans();
    } catch (error) {
      console.error("Error approving submission:", error);
      toast.error("Failed to approve submission");
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this submission?"))
      return;

    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(`${API}/submissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Submission rejected");
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to reject submission");
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-8">
          <h1
            className="text-5xl font-black tracking-tight text-slate-900 mb-2"
            data-testid="dashboard-title"
          >
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Manage artisans and worker submissions
          </p>
        </div>

        <Tabs defaultValue="artisans" className="w-full">
          {/* @ts-expect-error - Shadcn Tabs component uses JSX */}
          <TabsList className="mb-8" data-testid="dashboard-tabs">
            {/* @ts-expect-error - TabsTrigger accepts string children */}
            <TabsTrigger value="artisans" data-testid="artisans-tab">
              Artisans ({artisans.length})
            </TabsTrigger>
            {/* @ts-expect-error - TabsTrigger accepts string children */}
            <TabsTrigger value="submissions" data-testid="submissions-tab">
              Submissions ({pendingSubmissions.length})
            </TabsTrigger>
          </TabsList>

          {/* @ts-expect-error - Shadcn TabsContent component */}
          <TabsContent value="artisans">
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingArtisan(null);
                  setArtisanForm({
                    name: "",
                    phone: "",
                    location: "",
                    job_type: "",
                    photo_url: "",
                  });
                  setShowArtisanModal(true);
                }}
                className="bg-primary text-white hover:bg-primary-hover px-6 py-3 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-2"
                data-testid="add-artisan-btn"
              >
                <Plus size={20} />
                Add Artisan
              </button>
            </div>

            <div
              className="bg-white border border-slate-200 overflow-x-auto"
              data-testid="artisans-table"
            >
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Job Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {artisans.map((artisan) => (
                    <tr
                      key={artisan.id}
                      className="border-b border-slate-100"
                      data-testid={`artisan-row-${artisan.id}`}
                    >
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {artisan.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {artisan.job_type}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {artisan.location}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {artisan.phone}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {artisan.average_rating?.toFixed(1) || 0} (
                        {artisan.total_reviews || 0})
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/artisan/${artisan.id}`)}
                            className="text-slate-600 hover:text-primary transition-colors p-2"
                            data-testid={`view-artisan-${artisan.id}`}
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditArtisan(artisan)}
                            className="text-slate-600 hover:text-primary transition-colors p-2"
                            data-testid={`edit-artisan-${artisan.id}`}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteArtisan(artisan.id)}
                            className="text-slate-600 hover:text-red-600 transition-colors p-2"
                            data-testid={`delete-artisan-${artisan.id}`}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {artisans.length === 0 && (
                <div
                  className="p-12 text-center text-slate-600"
                  data-testid="no-artisans"
                >
                  No artisans yet. Click "Add Artisan" to create one.
                </div>
              )}
            </div>
          </TabsContent>

          {/* @ts-expect-error - Shadcn TabsContent component */}
          <TabsContent value="submissions">
            <div
              className="bg-white border border-slate-200 overflow-x-auto"
              data-testid="submissions-table"
            >
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Job Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-slate-100"
                      data-testid={`submission-row-${submission.id}`}
                    >
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {submission.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.job_type}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.location}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submission.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                            submission.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {submission.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleApproveSubmission(submission.id)
                              }
                              className="text-green-600 hover:text-green-700 transition-colors p-2"
                              data-testid={`approve-submission-${submission.id}`}
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSubmission(submission.id)
                              }
                              className="text-red-600 hover:text-red-700 transition-colors p-2"
                              data-testid={`reject-submission-${submission.id}`}
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {submissions.length === 0 && (
                <div
                  className="p-12 text-center text-slate-600"
                  data-testid="no-submissions"
                >
                  No worker submissions yet.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showArtisanModal} onOpenChange={setShowArtisanModal}>
        {/* @ts-expect-error - Shadcn Dialog components */}
        <DialogContent className="max-w-2xl" data-testid="artisan-modal">
          {/* @ts-expect-error - DialogHeader component */}
          <DialogHeader>
            {/* @ts-expect-error - DialogTitle component */}
            <DialogTitle className="text-2xl font-bold">
              {editingArtisan ? "Edit Artisan" : "Add New Artisan"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateArtisan}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={artisanForm.name}
                  onChange={(e) =>
                    setArtisanForm({ ...artisanForm, name: e.target.value })
                  }
                  className="w-full h-12 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4"
                  placeholder="Enter name"
                  data-testid="modal-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={artisanForm.phone}
                  onChange={(e) =>
                    setArtisanForm({ ...artisanForm, phone: e.target.value })
                  }
                  className="w-full h-12 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4"
                  placeholder="Enter phone number"
                  data-testid="modal-phone-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={artisanForm.location}
                  onChange={(e) =>
                    setArtisanForm({ ...artisanForm, location: e.target.value })
                  }
                  className="w-full h-12 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4"
                  placeholder="Enter location"
                  data-testid="modal-location-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Type *
                </label>
                <select
                  value={artisanForm.job_type}
                  onChange={(e) =>
                    setArtisanForm({ ...artisanForm, job_type: e.target.value })
                  }
                  className="w-full h-12 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4"
                  data-testid="modal-job-type-select"
                >
                  <option value="">Select job type</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Photo (optional)
                </label>
                {artisanForm.photo_url &&
                !artisanForm.photo_url.startsWith("/uploads") ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={artisanForm.photo_url}
                      alt="Preview"
                      className="w-24 h-24 object-cover border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setArtisanForm({ ...artisanForm, photo_url: "" })
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : artisanForm.photoFile ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={URL.createObjectURL(artisanForm.photoFile)}
                      alt="Preview"
                      className="w-24 h-24 object-cover border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setArtisanForm({ ...artisanForm, photoFile: null })
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      document.getElementById("admin-photo-input")?.click()
                    }
                    className="w-full h-24 border-2 border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer bg-white"
                  >
                    <p className="text-sm text-slate-500">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      JPG, PNG — max 5MB
                    </p>
                  </div>
                )}
                <input
                  id="admin-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setArtisanForm({ ...artisanForm, photoFile: file });
                  }}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-primary text-white hover:bg-primary-hover px-6 py-3 font-bold tracking-wide transition-all"
                data-testid="modal-save-btn"
              >
                {editingArtisan ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowArtisanModal(false);
                  setEditingArtisan(null);
                }}
                className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 px-6 py-3 font-bold tracking-wide transition-all"
                data-testid="modal-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
