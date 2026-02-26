interface Props {
  eventDate?: string;
  eventTime?: string;
}

export default function EventFooter({ eventDate, eventTime }: Props) {
  const formattedDate = eventDate
    ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).toUpperCase()
    : '';

  const formattedTime = eventTime
    ? new Date(`1970-01-01T${eventTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  return (
    <footer className="wedding-footer">
      {formattedDate && <p className="footer-date">{formattedDate}</p>}
      {formattedTime && <p className="footer-time">{formattedTime}</p>}
    </footer>
  );
}
