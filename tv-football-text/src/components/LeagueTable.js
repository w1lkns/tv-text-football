import React, { useState, useEffect } from "react";

export const LeagueTable = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define fetchData outside useEffect to make it accessible
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const cachedData = localStorage.getItem("championshipStandings");
    const cachedTime = localStorage.getItem("cacheTime");
    const now = new Date().getTime();

    // Check if data is less than 1 hour old
    if (cachedData && cachedTime && now - cachedTime < 3600000) {
      setTeams(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }

    const apiKey = process.env.REACT_APP_API_KEY; // Ensure this is set in your .env file
    const API_URL = "/v4/competitions/2016/standings"; // Full URL using proxy

    try {
      const response = await fetch(API_URL, {
        headers: { "X-Auth-Token": apiKey },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTeams(data.standings[0].table);

      // Cache the data and time in localStorage
      localStorage.setItem("championshipStandings", JSON.stringify(data.standings[0].table));
      localStorage.setItem("cacheTime", now.toString());

    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Call fetchData when the component mounts
  }, []); // Empty dependency array ensures this only happens on mount

  if (isLoading) return <p>Loading...</p>;
  if (error)
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={fetchData}>Retry</button>{" "}
        {/* Now fetchData is accessible */}
      </div>
    );

    // Function to determine the class based on the team's position
  const getClassForPosition = (position) => {
    if (position <= 2) return "promotion"; // 1st and 2nd place: Promotion
    if (position >= 3 && position <= 6) return "playoff"; // 3rd to 6th place: Playoffs
    if (position >= 22) return "relegation"; // 22nd to 24th place: Relegation
    return ""; // No special class
  };

  return (
    <table>
      <thead>
        <tr>
          <th colSpan="10">CHAMPIONSHIP</th>
        </tr>
        <tr>
          <th>Position</th>
          <th>Team</th>
          <th>PG</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>GF</th>
          <th>GA</th>
          <th>GD</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.position} className={getClassForPosition(team.position)}>
            <td>{team.position}</td>
            <td>{team.team.shortName}</td>
            <td>{team.playedGames}</td>
            <td>{team.won}</td>
            <td>{team.draw}</td>
            <td>{team.lost}</td>
            <td>{team.goalsFor}</td>
            <td>{team.goalsAgainst}</td>
            <td>{team.goalDifference}</td>
            <td>{team.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LeagueTable;
