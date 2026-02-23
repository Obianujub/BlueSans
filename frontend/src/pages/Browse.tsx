import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import axios from "axios";
import ArtisanCard from "../components/ArtisanCard";
import { Artisan } from "../types";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Browse: React.FC = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [filteredArtisans, setFilteredArtisans] = useState<Artisan[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchJobTypes();
    fetchArtisans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchJobTypes();
    fetchArtisans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchArtisans = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Artisan[]>(`${API}/artisans`);
      setArtisans(response.data);
      setFilteredArtisans(response.data);
    } catch (error) {
      console.error("Error fetching artisans:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterArtisans = () => {
    let filtered = [...artisans];

    if (searchTerm) {
      filtered = filtered.filter((artisan) =>
        artisan.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedJobType) {
      filtered = filtered.filter(
        (artisan) => artisan.job_type === selectedJobType,
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((artisan) =>
        artisan.location.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    setFilteredArtisans(filtered);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight leading-none text-slate-900 mb-4"
            data-testid="browse-title"
          >
            Browse <span className="text-primary">Artisans</span>
          </h1>
          <p className="text-lg text-slate-600" data-testid="browse-subtitle">
            Find the perfect professional for your project in Abuja
          </p>
        </div>

        <div
          className="bg-slate-50 border border-slate-200 p-6 mb-12"
          data-testid="filter-section"
        >
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} className="text-slate-600" />
            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search by Name
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search artisans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 pl-12 pr-4 text-lg placeholder:text-slate-400"
                  data-testid="search-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Type
              </label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg"
                data-testid="job-type-filter"
              >
                <option value="">All Job Types</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full h-14 bg-white border-2 border-slate-200 focus:border-primary focus:ring-0 px-4 text-lg placeholder:text-slate-400"
                data-testid="location-filter"
              />
            </div>
          </div>

          {(searchTerm || selectedJobType || locationFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedJobType("");
                setLocationFilter("");
              }}
              className="mt-4 text-primary hover:text-primary-hover font-medium"
              data-testid="clear-filters-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="loading-state">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading artisans...</p>
          </div>
        ) : filteredArtisans.length === 0 ? (
          <div className="text-center py-20" data-testid="no-results">
            <p className="text-xl text-slate-600">
              No artisans found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-600" data-testid="results-count">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filteredArtisans.length}
                </span>{" "}
                artisan{filteredArtisans.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-testid="artisans-grid"
            >
              {filteredArtisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Browse;
