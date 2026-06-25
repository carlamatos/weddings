interface Props {
  eventDate?: string;
  eventTime?: string;
}

export default function EventFooter({ eventDate, eventTime }: Props) {
  const formattedDate = eventDate
    ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const formattedTime = eventTime
    ? new Date(`1970-01-01T${eventTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : '';

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <p className="dash-card-title">Date &amp; Time</p>
      </div>
      <div className="dash-card-body">
        <div className="dash-datetime-display">
          <div className="dash-datetime-item">
            <span className="dash-datetime-label">Date</span>
            <span className="dash-datetime-value">{formattedDate || '—'}</span>
          </div>
          <div className="dash-datetime-item">
            <span className="dash-datetime-label">Time</span>
            <span className="dash-datetime-value">{formattedTime || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
