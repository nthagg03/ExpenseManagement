import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:3001/students");
      setStudents(res.data);
    } catch (error) {
      setStudents([
        {
          id: 1,
          name: "Tan Dam",
          status: "Active",
        },
      ]);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-5">
        <a className="navbar-brand" href="/">MY APP</a>

        <div className="navbar-nav">
          <a className="nav-link" href="/">Home</a>
          <a className="nav-link" href="/">Link</a>

          <div className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="/"
              role="button"
              data-bs-toggle="dropdown"
            >
              Options
            </a>

            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="/">Option 1</a></li>
              <li><a className="dropdown-item" href="/">Option 2</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2"></button>
        </div>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="https://picsum.photos/1600/350?random=1"
              className="d-block w-100 carousel-img"
              alt="morning"
            />
            <div className="carousel-caption">
              <h2>Good Morning</h2>
              <p>Spaces and Cybers.</p>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src="https://picsum.photos/1600/350?random=2"
              className="d-block w-100 carousel-img"
              alt="afternoon"
            />
            <div className="carousel-caption">
              <h2>Good Afternoon</h2>
              <p>Spaces and Cybers.</p>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src="https://picsum.photos/1600/350?random=3"
              className="d-block w-100 carousel-img"
              alt="night"
            />
            <div className="carousel-caption">
              <h2>Good Night</h2>
              <p>Spaces and Cybers.</p>
            </div>
          </div>
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      <table className="table table-bordered m-0">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name || student.username}</td>
              <td>{student.id}</td>
              <td>{student.status || "Active"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center mt-4 fs-5">
        ⚲Hanoi, August 2026
      </div>
    </div>
  );
}

export default App;