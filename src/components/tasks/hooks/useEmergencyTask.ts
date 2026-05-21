import { useState, FormEvent } from 'react';

interface UseEmergencyTaskProps {
  onComplete: () => void;
}

export function useEmergencyTask({ onComplete }: UseEmergencyTaskProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [meetingSubmitted, setMeetingSubmitted] = useState(false);
  const [meetingEjectedText, setMeetingEjectedText] = useState('');
  const [isEjecting, setIsEjecting] = useState(false);

  const handleVoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    const subject = encodeURIComponent(`Emergency Meeting Broadcast from ${contactName}`);
    const body = encodeURIComponent(
      `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ashfakhthedev@gmail.com&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');

    setIsEjecting(true);
    setMeetingSubmitted(true);

    const cleanName = contactName.substring(0, 15);
    setMeetingEjectedText(`${cleanName} initiated Emergency Broadcast. Message successfully ejected to Ashfakh M.`);

    setTimeout(() => {
      onComplete();
      setIsEjecting(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4500);
  };

  return {
    gameStarted,
    setGameStarted,
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactMessage,
    setContactMessage,
    meetingSubmitted,
    setMeetingSubmitted,
    meetingEjectedText,
    isEjecting,
    handleVoteSubmit
  };
}
