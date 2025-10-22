import { NextResponse } from "next/server";
export async function GET() {
  // Consulta la API pública de Syncore y filtra por Chile
  const res = await fetch("https://ql.syncore.org/api/servers?countries=CL");
  const allServers = await res.json();
  // Lista de IPs y puertos de Quake Club
  const quakeClubList = [
    "144.22.61.14:30000", "144.22.61.14:30001", "144.22.61.14:30002", "144.22.61.14:30003",
    "144.22.61.14:30004", "144.22.61.14:30005", "144.22.61.14:30006", "144.22.61.14:30007",
    "144.22.61.14:30008", "144.22.61.14:30009", "144.22.61.14:30010", "144.22.61.14:30012",
    "144.22.61.14:30013", "144.22.61.14:30014", "144.22.61.14:30015", "144.22.61.14:30016"
  ];
  // Filtrar solo los servidores de Quake Club
  // Usar la propiedad 'servers' del objeto recibido
  const serverList = allServers.servers || [];
  // Filtrar solo los servidores de Quake Club
  const servers = serverList.filter((s: any) => quakeClubList.includes(`${s.ip}:${s.port}`));
  // Solo devolver los datos necesarios
  const result = servers.map((s: any) => ({
    ip: s.ip,
    port: s.port,
    name: s.info?.serverName || '',
    map: s.info?.map || '',
    players: Array.isArray(s.players) ? s.players.length : 0,
    playerList: Array.isArray(s.players)
      ? s.players.map((p: any) => ({
          name: p.name,
          steamid64: p.steamid64 || p.steamId64 || p.steamid || undefined
        }))
      : [],
    maxplayers: s.info?.maxPlayers || s.maxplayers || '-',
    status: s.status
  }));
  return NextResponse.json(result);
}
