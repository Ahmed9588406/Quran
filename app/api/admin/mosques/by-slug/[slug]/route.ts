import { NextRequest, NextResponse } from "next/server";

// Use the stable backend URL
const API_BASE = "https://javabacked.twingroups.com/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // First, fetch all mosques to find the one with matching qrCodeUrl (slug)
    const mosquesResponse = await fetch(`${API_BASE}/mosques?size=100`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!mosquesResponse.ok) {
      throw new Error("Failed to fetch mosques");
    }

    const mosquesData = await mosquesResponse.json();
    const mosques = mosquesData.content || mosquesData || [];

    // Find mosque by qrCodeUrl (the slug)
    const mosque = mosques.find(
      (m: { qrCodeUrl?: string }) => m.qrCodeUrl === slug
    );

    if (!mosque) {
      return NextResponse.json(
        { error: "Mosque not found", slug },
        { status: 404 }
      );
    }

    // If mosque has a current room, fetch room details
    let room = null;
    let hasActiveStream = false;

    if (mosque.currentRoomId) {
      try {
        // Fetch room info
        const roomsResponse = await fetch(`${API_BASE}/live-streams?size=100`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          const rooms = roomsData.content || roomsData || [];
          
          // Find room by roomId
          room = rooms.find(
            (r: { roomId?: number; status?: string }) => 
              r.roomId === mosque.currentRoomId && r.status === "ACTIVE"
          );

          if (room) {
            hasActiveStream = room.status === "ACTIVE";
          }
        }
      } catch (err) {
        console.error("Error fetching room info:", err);
      }
    }

    // If no room found by currentRoomId, try to find any active room for this mosque
    if (!room) {
      try {
        const roomsResponse = await fetch(`${API_BASE}/live-streams?size=100`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          const rooms = roomsData.content || roomsData || [];
          
          // Find any active room for this mosque
          room = rooms.find(
            (r: { mosque?: { id?: number }; status?: string }) => 
              r.mosque?.id === mosque.id && r.status === "ACTIVE"
          );

          if (room) {
            hasActiveStream = true;
          }
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    }

    return NextResponse.json({
      mosque: {
        id: mosque.id,
        name: mosque.name,
        city: mosque.city,
        country: mosque.country,
        address: mosque.address,
        preacher: mosque.preacher,
      },
      room: room ? {
        id: room.id,
        roomId: room.roomId,
        title: room.title,
        status: room.status,
        listenerCount: room.listenerCount || 0,
      } : null,
      hasActiveStream,
    });
  } catch (error) {
    console.error("Error in mosque by-slug API:", error);
    return NextResponse.json(
      { error: "Failed to fetch mosque info" },
      { status: 500 }
    );
  }
}
