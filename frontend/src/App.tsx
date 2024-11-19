import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./components/DataTable/data-table";
import { columns } from "./components/DataTable/columns.tsx";
import { Input } from "./components/ui/input.tsx";
const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:5000";
function App() {
  const [loading, setLoading] = useState({
    login: false,
    data: false,
    searchInbox: false,
  });
  const [emails, setEmails] = useState<any>([]);
  const [error, setError] = useState("");
  const [isLoggedIn, setisLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [searchSubject, setSearchSubject] = useState("");
  const handleLogin = async () => {
    setLoading({ ...loading, login: true });
    try {
      const response = await axios.get(`${BACKEND_URL}/auth/login`, {
        withCredentials: true,
      });
      if (response.data.url) window.location.href = response.data.url;
    } catch (err) {
      setError("Failed to fetch emails. Please try again.");
      console.error(err);
    }
    setLoading({ ...loading, login: false });
  };
  const handleSearch = async () => {
    setLoading({ ...loading, searchInbox: true });
    try {
      await axios.post(
        `${BACKEND_URL}/search-csv`,
        { searchSubject },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      setError("Failed to fetch emails. Please try again.");
      console.error(err);
    }
    setLoading({ ...loading, searchInbox: false });
  };
  const getData = async () => {
    setLoading({ ...loading, data: true });
    setError("");
    setEmails([]);
    try {
      const response = await axios.get(`${BACKEND_URL}/getData`, {
        withCredentials: true,
      });
      setEmails(response.data);
    } catch (err) {
      setError("Failed to fetch emails. Please try again.");
      console.error(err);
    }

    setLoading({ ...loading, data: false });
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      axios
        .get(`${BACKEND_URL}/auth/callback?code=${code}`, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("Token received:", response.data);
          if (response.data.status) {
            localStorage.setItem("isLoggedIn", "true");
            setisLoggedIn(true);
          }
          window.location.href = FRONTEND_URL;
        })
        .catch((error) => {
          console.error("Error exchanging code for token:", error);
        });
    }
  }, [window.location]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-4">Gmail CSV Search</h1>
        <div className="flex  gap-4 justify-center items-center">
          <Button
            onClick={
              isLoggedIn
                ? () => {
                    localStorage.clear();
                    setisLoggedIn(false);
                  }
                : handleLogin
            }
            disabled={loading.login}
          >
            {loading.login ? "Logging in..." : isLoggedIn ? "Log Out" : "Login"}
          </Button>
          <div className="flex justify-around gap-5">
            <Input
              type="text"
              onChange={(e) => setSearchSubject(e.target.value)}
              value={searchSubject}
              placeholder="Gmail Subject Name"
            />
            <Button
              onClick={handleSearch}
              disabled={loading.searchInbox || !isLoggedIn}
            >
              {loading.searchInbox
                ? "Getting emails from inBox ..."
                : "Search CSV Emails"}
            </Button>
          </div>
          <Button onClick={getData} disabled={loading.data || !isLoggedIn}>
            {loading.data ? "Fetching Data..." : "get Data"}
          </Button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
      <div className="min-w-[830px]">
        <DataTable columns={columns} data={emails} />
      </div>
    </div>
  );
}

export default App;
