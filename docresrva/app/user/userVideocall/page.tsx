"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import io from "socket.io-client";

// Initialize socket connection dynamically to prevent SSR issues
let socket: any;
if (typeof window !== "undefined") {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "");
}

interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
}

const RoomPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomComponent />
    </Suspense>
  );
};

const RoomComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get("id") || "Your Name";

  const [doctor, setDoctor] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");

  const meetingRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsClient(true);
    
    // Access localStorage safely
    if (typeof window !== "undefined") {
      
      const generatedLink = `${window.location.origin}/userVideocall?roomId=${roomId}`;
      setShareLink(generatedLink);
    }
  }, [roomId]);

  

  async function sendMsg(shareLink: string, activeUser: any) {
    console.log("active" + activeUser);

    const newMessage: Message = {
      sender: "Doctor",
      receiver: "patient",
      content: shareLink,
      timestamp: new Date(),
    };

    try {
      socket.emit("sendMessage", { roomId: activeUser, message: newMessage });
    } catch (error: any) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  }

  function handleExit() {
    if (typeof window !== "undefined" && window.opener) {
      window.close();
    } else {
      router.push("/user/message");
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
            "Sasi"
          );

          const zc = ZegoUIKitPrebuilt.create(kitToken);
          zc.joinRoom({
            container: meetingRef.current,
            sharedLinks: [{ name: "Copy Link", url: shareLink }],
            scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
            showScreenSharingButton: false,
            onLeaveRoom: handleExit,
          });

          sendMsg(shareLink, roomId);
        })
        .catch((error) => {
          console.error("Error loading ZegoUIKitPrebuilt:", error);
        });
    }
  }, [isClient, shareLink, roomId]);

  if (!isClient) return null;

  return <div ref={meetingRef} style={{ width: "100%", height: "100vh" }} />;
};

export default RoomPage;
