import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavList from '../components/NavList'; // Import the NavList component
import FilterComponent from '../components/FilterComponent'; // Import the FilterComponent
import '../styles/TicketBoardStaff.css';

import axios from 'axios';

const AdminBoard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState({ todo: [], inProgress: [], done: [], close: [] });
  const [filteredTickets, setFilteredTickets] = useState({ todo: [], inProgress: [], done: [], close: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadTickets(token); // Fetch tickets when the component mounts or refreshes
    }
  }, []); // Empty dependency array, so it runs only once when the component mounts

  // Fetch tickets from API
  const fetchTickets = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/TicketService/tickets', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

       const organizedTickets = {
        todo: response.data.filter(ticket => ticket.status === 'To Do'),
        inProgress: response.data.filter(ticket => ticket.status === 'In Progress'),
        done: response.data.filter(ticket => ticket.status === 'Done'),
        close: response.data.filter(ticket => ticket.status === 'Closed'),
      };

      // Cache the tickets in localStorage to avoid unnecessary API calls
      localStorage.setItem('tickets', JSON.stringify(organizedTickets));
      return organizedTickets;
    } catch (error) {
      console.error('Error fetching tickets:', error.response || error.message);
      setError(`Failed to fetch tickets: ${error.response?.data || error.message}`);
    }
  };

  // Load tickets from either localStorage or fetch them if not available
  const loadTickets = async (token) => {
    setLoading(true);

    // Fetch tickets from the API, regardless of what's in localStorage
    const tickets = await fetchTickets(token); // Always fetch from the API
    if (tickets) {
      setTickets(tickets);
      setFilteredTickets(tickets);
    }
    setLoading(false);
  };

  const updateTicketStatus = async (ticketId, newStatus, token) => {
    try {
      await axios.put(
        'http://localhost:8080/TicketService/ticket/update',
        { ticketId, status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      setError(`Failed to update ticket status: ${error.response?.data || error.message}`);
    }
  };

  useEffect(() => {
    filterTickets();
  }, [searchInput, startDate, endDate, selectedStatus, tickets]);

  const filterTickets = () => {
    const allStatuses = ['todo', 'inProgress', 'done', 'close'];
    const filtered = {};

    allStatuses.forEach((status) => {
      let statusTickets = tickets[status] || [];

      if (selectedStatus && selectedStatus !== status) {
        statusTickets = [];
      }

      if (searchInput) {
        statusTickets = statusTickets.filter(ticket => {
          const assigneeName = ticket.misStaff
            ? `${ticket.misStaff.firstName} ${ticket.misStaff.lastName}`.toLowerCase()
            : '';
          const issue = ticket.issue ? ticket.issue.toLowerCase() : '';
          return (
            assigneeName.includes(searchInput.toLowerCase()) ||
            issue.includes(searchInput.toLowerCase())
          );
        });
      }

      if (startDate || endDate) {
        statusTickets = statusTickets.filter(ticket => {
          const ticketDate = new Date(ticket.dateCreated);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) : null;

          return (!start || ticketDate >= start) && (!end || ticketDate <= end);
        });
      }

      filtered[status] = statusTickets;
    });

    setFilteredTickets(filtered);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    if (!ticketId) return;
  
    const updatedTickets = { ...tickets };
    const allStatuses = ['todo', 'inProgress', 'done', 'close'];
    let movedTicket;
  
    for (const status of allStatuses) {
      const ticketIndex = updatedTickets[status].findIndex(ticket => ticket.ticketId === ticketId);
      if (ticketIndex > -1) {
        movedTicket = updatedTickets[status].splice(ticketIndex, 1)[0];
        break;
      }
    }
  
    if (movedTicket) {
      movedTicket.status =
        newStatus === 'todo'
          ? 'To Do'
          : newStatus === 'inProgress'
          ? 'In Progress'
          : newStatus === 'done'
          ? 'Done'
          : 'Closed';
  
      // Set the dateFinished to today's date if the status is "Done" or "Closed"
      if (newStatus === 'done' || newStatus === 'close') {
        movedTicket.dateFinished = new Date().toISOString(); // Set the current date and time
      }
  
      updatedTickets[newStatus].push(movedTicket);
      setTickets(updatedTickets);
      setFilteredTickets(updatedTickets);
      localStorage.setItem('tickets', JSON.stringify(updatedTickets)); // Cache the updated tickets
  
      const token = localStorage.getItem('token');
      await updateTicketStatus(ticketId, movedTicket.status, token);
    }
  };
  

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="semi-body">
      <NavList handleLogout={handleLogout} />
      <div className="content-container">
        <div className="filter-container">
          <FilterComponent
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            resetFilters={() => {
              setStartDate('');
              setEndDate('');
              setSearchInput('');
              setSelectedStatus('');
            }}
          />
        </div>

        <div className="ticket-board-container">
          {loading && <div className="loading-message">Loading tickets...</div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && (
            <div className="ticket-columns">
              {['todo', 'inProgress', 'done', 'close'].map((status) => (
                <div key={status} className="ticket-column">
                  <div className={`status-box ${status}`}>
                    {status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : status === 'done' ? 'Done' : 'Closed'}
                  </div>
                  {filteredTickets[status] && filteredTickets[status].length > 0 ? (
                    filteredTickets[status].map((ticket) => (
                      <div key={ticket?.ticketId?.toString() || 'default-id'} className="ticket-item">
                        <h5>{ticket?.issue || 'No issue provided'}</h5>
                        <p>Assigned to: {ticket?.misStaff ? `${ticket.misStaff.firstName} ${ticket.misStaff.lastName}` : 'Unassigned'}</p>
                        <p>Date Created: {ticket?.dateCreated ? new Date(ticket.dateCreated).toLocaleString() : 'Not Available'}</p>
                        <p>Date Finished: {ticket?.dateFinished ? new Date(ticket.dateFinished).toLocaleString() : 'Not Available'}</p>
                        {status !== 'close' && (
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(ticket?.ticketId, e.target.value)}
                          >
                            <option value="todo">To do</option>
                            <option value="inProgress">In progress</option>
                            <option value="done">Done</option>
                            <option value="close">Closed</option>
                          </select>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-message">No tickets available.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default AdminBoard;
