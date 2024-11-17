import React from 'react';
import '../styles/FilterComponent.css'; // Add a new CSS file for styling this filter component

const FilterComponent = ({ 
  searchInput, 
  setSearchInput, 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  selectedStatus, 
  setSelectedStatus, 
  tickets, 
  setFilteredTickets 
}) => {

  const handleDateChange = (event, setDate) => {
    setDate(event.target.value); // Set the selected date directly
  };

  const handleStartDateChange = (event) => {
    handleDateChange(event, setStartDate);
  };

  const handleEndDateChange = (event) => {
    handleDateChange(event, setEndDate);
  };

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filterTickets = () => {
    const allStatuses = ['todo', 'inProgress', 'done', 'close'];
    const filtered = {};

    allStatuses.forEach((status) => {
      let statusTickets = tickets[status];

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

    setFilteredTickets(filtered); // Update filtered tickets
  };

  return (
    <div className="filter-component">
      <div className="search-filter">
        <input
          type="text"
          className="search-input"
          placeholder="Search ticket description"
          value={searchInput}
          onChange={handleSearchChange}
        />
      </div>
      <div className="date-filter">
        <label>Start Date:</label>
        <input
          type="date"
          className="date-input"
          id="start-date"
          name="start-date"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <label>End Date:</label>
        <input
          type="date"
          className="date-input"
          id="end-date"
          name="end-date"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </div>
      </div>
  );
};

export default FilterComponent;