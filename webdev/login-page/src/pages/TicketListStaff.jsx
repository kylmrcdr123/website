import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TicketListStaff.css';
import { useNavigate } from 'react-router-dom';
import { RiEdit2Fill } from 'react-icons/ri';
import EditTicketModal from '../components/EditTicketModal';
import NavlistMis from '../components/NavlistMis'; 
import FilterComponent from '../components/FilterComponent'; 

const TicketListStaff = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [cachedTickets, setCachedTickets] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const exp = localStorage.getItem('exp');
  
    if (!token || !exp || Date.now() >= exp * 1000) {
      localStorage.clear();
      navigate('/login');  // Redirect to login if token is invalid or expired
  
      // Optionally reload the page after clearing the localStorage
      window.location.reload(); 
    }
  }, [navigate]);
  
  const fetchTickets = async () => {
    const cachedTickets = localStorage.getItem('tickets');
    if (cachedTickets) {
      const parsedTickets = JSON.parse(cachedTickets);
  
      // Flatten tickets if they are in an object with status keys
      const flattenedTickets = Object.values(parsedTickets).flat();
      setTickets(flattenedTickets);
      setLoading(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const ticketsResponse = await axios.get('http://localhost:8080/TicketService/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const fetchedTickets = ticketsResponse.data;
      if (Array.isArray(fetchedTickets)) {
        setTickets(fetchedTickets);
        localStorage.setItem('tickets', JSON.stringify(fetchedTickets)); // Cache the data
      } else {
        setError('Unexpected data format received for tickets.');
      }
    } catch (error) {
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    const allTickets = Array.isArray(tickets) ? tickets : [];

    const filtered = allTickets.filter(ticket => {
      const ticketDate = new Date(ticket.dateCreated).toISOString().split("T")[0];
      const start = startDate ? new Date(startDate).toISOString().split("T")[0] : null;
      const end = endDate ? new Date(endDate).toISOString().split("T")[0] : null;

      const matchDate = (!start || ticketDate >= start) && (!end || ticketDate <= end);
      const matchSearch = !searchInput || (ticket.issue && ticket.issue.toLowerCase().includes(searchInput.toLowerCase()));
      const matchStatus = !selectedStatus || ticket.status === selectedStatus;
      const matchStaff = !selectedStaff || (ticket.misStaff && `${ticket.misStaff.firstName} ${ticket.misStaff.lastName}` === selectedStaff);

      return matchDate && matchSearch && matchStatus && matchStaff;
    });

    setFilteredTickets(filtered);
  };

  const fetchStaffList = async () => {
    const cachedStaff = localStorage.getItem('staffList');
    if (cachedStaff) {
      setStaffList(JSON.parse(cachedStaff));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const staffResponse = await axios.get('http://localhost:8080/MisStaffService/staff', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(staffResponse.data)) {
        setStaffList(staffResponse.data);
        localStorage.setItem('staffList', JSON.stringify(staffResponse.data)); // Cache the data
      }
    } catch (error) {
      setError('Failed to fetch staff list. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStaffList(); 
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      filterTickets();
    }
  }, [startDate, endDate, tickets, searchInput, selectedStatus, selectedStaff]);

  const handleTicketUpdate = (updatedTicket) => {
    // Ensure cachedTickets is an array before calling .map()
    if (Array.isArray(cachedTickets)) {
      const updatedTickets = cachedTickets.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      );
      setCachedTickets(updatedTickets);
    } else {
      setCachedTickets([]); 
    }
  };

  const handleCloseModal = () => {
    localStorage.removeItem('tickets');  // Clear the cache if necessary
    fetchTickets();  // Re-fetch tickets from the backend
    setSelectedTicket(null);  // Close the modal
  };

  return (
    <div className="semi-body">
      <NavlistMis handleLogout={() => navigate('/login')} />

      <div className="content-container">
        <div className="filter-container">
          <FilterComponent
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            resetFilters={() => setFilteredTickets(tickets)}
          />

          <div className="filter-item">
            <select 
              id="statusFilter"
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="custom-dropdown"
            >
              <option value="">All Statuses</option>
              {['To Do', 'In Progress', 'Done', 'Closed'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select 
              id="staffFilter"
              value={selectedStaff} 
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="custom-dropdown"
            >
              <option value="">All Staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                  {staff.firstName} {staff.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="list-of-tickets">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="ticket-table-container">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Date Finished</th>
                    <th>Assigned To</th>
                    <th>Reporter Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="7">No tickets found.</td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.ticketId}>
                        <td>{ticket.issue || 'No issue description'}</td>
                        <td>{ticket.status}</td>
                        <td>{new Date(ticket.dateCreated).toLocaleDateString()}</td>
                        <td>{ticket.dateFinished ? new Date(ticket.dateFinished).toLocaleDateString() : 'Not finished'}</td>
                        <td>{ticket.misStaff ? `${ticket.misStaff.firstName} ${ticket.misStaff.lastName}` : 'No staff assigned'}</td>
                        <td>{ticket.reporter || 'Unknown'}</td>
                        <td>
                          <RiEdit2Fill
                            size={20}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedTicket(ticket)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedTicket && (
        <EditTicketModal
          ticket={selectedTicket}
          onClose={handleCloseModal}
          onUpdate={handleTicketUpdate}  // This should trigger when modal closes or when ticket updates
        />
      )}
    </div>
  );
};

export default TicketListStaff;
