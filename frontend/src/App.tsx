import  { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { Button } from "@/components/ui/button"
import { DataTable } from "./components/DataTable/data-table";
import { columns } from "./components/DataTable/columns.tsx";

function App() {
  const [loading, setLoading] = useState({login :  false , data : false , searchInbox : false});
  const [emails, setEmails] = useState<any>([]);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading({ ... loading , login : true});
   
    try {
      // Replace with your backend endpoint URL
      const response = await axios.get("http://localhost:5000/auth/login",{ withCredentials: true });
      if(response.data.url)
        window.location.href = response.data.url; 
    } catch (err) {
      setError("Failed to fetch emails. Please try again.");
      console.error(err);
      
    }

    setLoading({ ... loading , login : false});
  };
  const handleSearch = async () => {
    setLoading({ ... loading , searchInbox : true});
    try {
      const response = await axios.get("http://localhost:5000/search-csv", { withCredentials: true });
      // setEmails(response.data);
      console.log("response-----", response);  
    } catch (err) {
      setError("Failed to fetch emails. Please try again.");
      console.error(err);
    }

    setLoading({ ... loading , searchInbox : false});
  };
  const getData = async () => {
    setLoading({ ... loading , data : true});
    setError("");
    setEmails([]);

    try {
      
      const response = await axios.get("http://localhost:5000/getData", { withCredentials: true });
      // setEmails(response.data);
      setEmails(response.data)
      
    } catch (err) {
      setError("Failed to fetch emails. Please try again.");
      console.error(err);
    }

    setLoading({ ... loading , data : false});
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code'); 
    if (code) {
        axios.get(`http://localhost:5000/auth/callback?code=${code}`,{ withCredentials: true })
            .then(response => {
                console.log('Token received:', response.data);
                window.location.href = 'http://localhost:5173'; 
            })
            .catch(error => {
                console.error('Error exchanging code for token:', error);
            });
    }
}, [window.location]);


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-4">Gmail CSV Search</h1>
        <div className="flex gap-4 justify-center"> 
        <Button onClick={handleLogin} disabled={loading.login}>
          {loading.login ? "Logging in..." : "Login"}
        </Button>
        <Button onClick={handleSearch} disabled={loading.searchInbox}>
          {loading.searchInbox ? "Getting emails from inBox ..." : "Search CSV Emails"}
        </Button>
        <Button onClick={getData} disabled={loading.data}>
          {loading.data ? "Fetching Data..." : "get Data"}
        </Button>
        {error && <p className="error">{error}</p>}
        </div>
      </div>
    <DataTable columns={columns} data={emails} />
    </div>
  );
}

export default App;

// https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly&response_type=code&client_id=1006342344110-6ng91d40bootooab7eik8npmaa62f70n.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback
// https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly&response_type=code&client_id=1006342344110-6ng91d40bootooab7eik8npmaa62f70n.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback