"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

// Initialize socket connection
const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "");

interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
}

const RoomPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("Your Name");
  const doctor = localStorage.getItem('Doctor');

  useEffect(() => {
    const roomIdFromParams = searchParams.get("id");
    if (roomIdFromParams) {
      setRoomId(roomIdFromParams);
    }
  }, [searchParams]);

  let doctors = "Docreserva"; // You can adjust this based on your use case.

  if (!doctors) {
    console.error("Doctor data not found in localStorage.");
    return <div>Error: No doctor data found</div>;
  }

  const meetingRef = useRef<HTMLDivElement>(null);

  const [isClient, setIsClient] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");

  const activeUser = roomId;

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const generatedLink = `${window.location.origin}/userVideocall?id=${roomId}`;
      setShareLink(generatedLink);
    }
  }, [roomId]);

  async function sendMsg(shareLink: string, activeUser: any) {
    console.log('active' + activeUser);

    const newMessage: Message = {
      sender: "Doctor",
      receiver: "patient",
      content: shareLink,
      timestamp: new Date(),
    };

    try {
      socket.emit('sendMessage', { roomId: activeUser, message: newMessage });

      await axios.put(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/chat`,
        { activeUser, message: newMessage },
        { withCredentials: true }
      );
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  }

  function handleExit() {
    if (typeof window !== "undefined" && window.opener) {
      window.close();
    } else {
      router.push("/doctorHome");
    }
  }

  useEffect(() => {
    if (isClient && shareLink && meetingRef.current) {
      import("@zegocloud/zego-uikit-prebuilt")
        .then(({ ZegoUIKitPrebuilt }) => {
          const appId = 1264975725;
          const serverSecret = "a784188d9c0ba95fbc6cb8e80c9ae040";
          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appId,
            serverSecret,
            roomId,
            Date.now().toString(),
            doctors
          );

          const zc = ZegoUIKitPrebuilt.create(kitToken);
          zc.joinRoom({
            container: meetingRef.current,
            sharedLinks: [{ name: "Copy Link", url: shareLink }],
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            showScreenSharingButton: false,
            onLeaveRoom: handleExit,
          });

          sendMsg(shareLink, roomId); // Send the share link message after joining the room
        })
        .catch((error) => {
          console.error("Error loading ZegoUIKitPrebuilt:", error);
        });
    }
  }, [isClient, shareLink, roomId, doctors]);

  if (!isClient) return null;

  return <div ref={meetingRef} style={{ width: "100%", height: "100vh" }} />;
};

const RoomPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomPageContent />
    </Suspense>
  );
};

export default RoomPage;
