import { useState, useEffect, useRef } from "react";
import { CheckCircle, Upload, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { WorkerSubmissionCreate } from "../types";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Apply: React.FC = () => {
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState<WorkerSubmissionCreate>({
    name: "",
    phone: "",
    location: "",
    job_type: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchJobTypes();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.location.trim() ||
      !formData.job_type
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("location", formData.location);
      data.append("job_type", formData.job_type);
      if (photo) data.append("photo", photo);

      await axios.post(`${API}/submissions`, data);
      toast.success("Application submitted successfully!");
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = () => {
    setFormData({ name: "", phone: "", location: "", job_type: "" });
    setSubmitted(false);
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  if (submitted) {
    return (
      <div
        className="min-h-screen bg-white pt-32 pb-20"
        data-testid="success-message"
      >
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-slate-50 border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-primary" size={48} />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Application Submitted!
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for your interest in joining BlueSans. Your application
              has been received and will be reviewed by our admin team.
            </p>
            <button
              onClick={handleNewApplication}
              className="bg-primary text-white hover:bg-primary-hover px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95"
              data-testid="new-application-btn"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight leading-none text-slate-900 mb-4"
            data-testid="apply-title"
          >
            Apply as <span className="text-primary">Worker</span>
          </h1>
          <p className="text-lg text-slate-600" data-testid="apply-subtitle">
            Join BlueSans and connect with clients looking for your skills. Fill
            out the form below to get started.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Profile Photo (optional)
          </label>
          {photoPreview ? (
            <div className="relative w-32 h-32">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 object-cover border-2 border-slate-200"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer bg-white"
            >
              <Upload className="text-slate-400 mb-2" size={28} />
              <p className="text-sm text-slate-500">Click to upload a photo</p>
              <p className="text-xs text-slate-400 mt-1">
                JPG, PNG, WEBP — max 5MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div
          className="bg-slate-50 border border-slate-200 p-8"
          data-testid="application-form"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Application Form
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg placeholder:text-slate-400"
                placeholder="Enter your full name"
                data-testid="name-input"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg placeholder:text-slate-400"
                placeholder="Enter your phone number"
                data-testid="phone-input"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location in Abuja *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg placeholder:text-slate-400"
                placeholder="e.g., Wuse, Garki, Maitama"
                data-testid="location-input"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Type *
              </label>
              <select
                value={formData.job_type}
                onChange={(e) =>
                  setFormData({ ...formData, job_type: e.target.value })
                }
                className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg"
                data-testid="job-type-select"
              >
                <option value="">Select your profession</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary-hover px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-application-btn"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Apply;
