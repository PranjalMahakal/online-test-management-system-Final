import React from 'react';

export default function ProgressReport({ reports }) {
  if (!reports || reports.length === 0) {
    return <p>No test activity recorded yet. Start a test to see results!</p>;
  }

  return (
    <div>
      <h3>Your Test Progress & Activity</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Test & Subject</th>
            <th> Timing </th>
            <th>Questions (Att./Unatt.)</th>
            <th>Marks</th>
            <th>Percentage</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.testName}</strong>
                <br />
                <small>{r.subject}</small>
              </td>
              <td>
                <small>Start: {r.startTime}</small><br />
                <small>End: {r.endTime}</small>
              </td>
              <td>
                Total: {r.totalQuestions}<br />
                ({r.attempted} / {r.unanswered})
              </td>
              <td>{r.marksObtained} / {r.totalMarks}</td>
              <td>{r.percentage}%</td>
              <td>
                <span className={`badge ${r.status === 'Pass' ? 'badge-pass' : 'badge-fail'}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}