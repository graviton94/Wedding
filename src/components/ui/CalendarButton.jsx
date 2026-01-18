import React from 'react';
import Button from './Button';

const CalendarButton = ({ eventDetails }) => {
    const generateICS = () => {
        const {
            title = "결혼식",
            description = "",
            location = "",
            startDate,
            endDate,
            alarm1 = 1440,
            alarm2 = 60
        } = eventDetails;

        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}${seconds}`;
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@wedding-invitation.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT${alarm1}M
DESCRIPTION:${title} - 1일 전 알림
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-PT${alarm2}M
DESCRIPTION:${title} - 1시간 전 알림
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

        return icsContent;
    };

    const handleDownload = () => {
        const icsContent = generateICS();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'wedding-invitation.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Button
            variant="primary"
            onClick={handleDownload}
            className="w-full py-4 rounded-xl"
        >
            📅 캘린더에 저장하기
        </Button>
    );
};

export default CalendarButton;
