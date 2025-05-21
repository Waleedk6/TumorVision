import React from 'react';

const Patients = () => {
  // In a real app, this data would come from props/API
  const patients = []; // Empty array - will be populated dynamically

  return (
    <div className="patients-page">
      <h1>Patient Records</h1>
      
      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Scan Date</th>
              <th>Result</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr 
                key={patient.id}
                className={patient.result === 'Tumor Detected' ? 'positive-case' : 'negative-case'}
              >
                <td>{patient.name} <small>ID: {patient.id}</small></td>
                <td>{patient.age}</td>
                <td>{patient.scanDate}</td>
                <td>{patient.result}</td>
                <td>{patient.confidence}%</td>
                <td>
                  <button className="btn-view">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Patients;