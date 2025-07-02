import { EventData, Match, Team } from '@/types';

/**
 * Fetch data from The Blue Alliance API
 */
export async function fetchTba(endpoint: string, apiKey: string) {
  try {
    const response = await fetch(`https://www.thebluealliance.com/api/v3${endpoint}`, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TBA API Error (${response.status}): ${errorText}`);
      throw new Error(`TBA API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`Error fetching from TBA API: ${error.message}`);
  } else {
    console.error('Unknown error fetching from TBA API:', error);
  }
  throw error;
}

}

/**
 * Process TBA match data into our app's format
 */
function processTbaMatch(match: any): Match {
  // Extract alliance teams
  const redAlliance = match.alliances?.red?.team_keys?.map((key: string) => parseInt(key.replace('frc', ''))) || [];
  const blueAlliance = match.alliances?.blue?.team_keys?.map((key: string) => parseInt(key.replace('frc', ''))) || [];

  
  // Extract scores
  const redScore = match.alliances?.red?.score !== null ? match.alliances?.red?.score : undefined;
  const blueScore = match.alliances?.blue?.score !== null ? match.alliances?.blue?.score : undefined;
  
  // Determine if match is completed
  // A match is only completed if it has an actual_time or comp_level is not practice/qualification and has valid scores
  const hasActualTime = match.actual_time !== null && match.actual_time !== undefined && match.actual_time > 0;
  const hasValidScores = redScore !== undefined && blueScore !== undefined && 
                         redScore !== null && blueScore !== null &&
                         match.alliances?.red?.score !== null && match.alliances?.blue?.score !== null;
  
  // Check if match is in the future
  const matchTime = match.time ? match.time * 1000 : null;
  const isInFuture = matchTime && matchTime > Date.now();
  
  // A match is completed if it has an actual time or has valid scores and is not in the future
  const completed = hasActualTime || 
                   (hasValidScores && !isInFuture && match.comp_level !== 'pr');
  
  // Only determine winner if the match is actually completed
  let winner: 'red' | 'blue' | 'tie' | null = null;
  if (completed) {
    if (match.winning_alliance === 'red') winner = 'red';
    else if (match.winning_alliance === 'blue') winner = 'blue';
    else if (hasValidScores) {
      if (redScore > blueScore) winner = 'red';
      else if (blueScore > redScore) winner = 'blue';
      else if (redScore === blueScore) winner = 'tie';
    }
  }
  
  // Extract match number and type
  const matchNumber = match.match_number || 0;
  let matchType: Match['matchType'] = 'qualification';
  if (match.comp_level === 'qm') matchType = 'qualification';
  else if (match.comp_level === 'qf') matchType = 'quarterfinal';
  else if (match.comp_level === 'sf') matchType = 'semifinal';
  else if (match.comp_level === 'f') matchType = 'final';
  else if (match.comp_level === 'pr') matchType = 'practice';
  
  if (completed) {
    if (match.winning_alliance === 'red') winner = 'red';
    else if (match.winning_alliance === 'blue') winner = 'blue';
    else if (hasValidScores) {
      if (redScore > blueScore) winner = 'red';
      else if (blueScore > redScore) winner = 'blue';
      else if (redScore === blueScore) winner = 'tie';
    }
  }

  return {
    id: match.key || `match_${matchNumber}`,
    matchNumber,
    matchType,
    redAlliance,
    blueAlliance,
    redScore: completed ? redScore : undefined,
    blueScore: completed ? blueScore : undefined,
    winner: completed ? winner : null,
    scheduledTime: match.predicted_time ? match.predicted_time * 1000 : match.time ? match.time * 1000 : Date.now(),
    actualTime: match.actual_time ? match.actual_time * 1000 : undefined,
    completed,
    timestamp: match.actual_time ? match.actual_time * 1000 : match.time ? match.time * 1000 : Date.now(),
    eventKey: match.event_key
  };

}

/**
 * Process TBA team data into our app's format
 */
function processTbaTeam(team: any): Team {
  return {
    id: team.team_number || parseInt(team.key?.replace('frc', '')) || 0,
    key: team.key,
    number: team.team_number,
    team_number: team.team_number,
    name: team.nickname || `Team ${team.team_number}`,
    nickname: team.nickname,
    city: team.city,
    state: team.state_prov,
    country: team.country,
    rookie_year: team.rookie_year
  };
}

/**
 * Process TBA event data into our app's format
 */
function processTbaEvent(event: any): EventData {
  return {
    key: event.key,
    name: event.name,
    shortName: event.short_name,
    eventCode: event.event_code,
    eventType: event.event_type,
    district: event.district?.abbreviation,
    city: event.city,
    stateProv: event.state_prov,
    country: event.country,
    startDate: event.start_date,
    endDate: event.end_date,
    year: event.year,
    website: event.website,
    timezone: event.timezone,
    location: {
      lat: event.lat,
      lng: event.lng,
      address: event.address,
      locationName: event.location_name
    }
  };
}

/**
 * Get all events, matches, and teams for a specific team
 */
export async function getTeamEventsAndMatches(
  teamNumber: number | string, 
  apiKey: string, 
  year: number = new Date().getFullYear()
) {
  
  const teamKey = `frc${teamNumber}`;
  
  try {
    // Get all events for the team in the current year
    const eventsData = await fetchTba(`/team/${teamKey}/events/${year}`, apiKey);
    
    // Process events
    const events = eventsData.map(processTbaEvent);
    
    // Get all matches and teams for each event
    let allMatches: Match[] = [];
    let allTeamsMap = new Map<string, Team>();
    
    for (const event of eventsData) {
      
      try {
        // Get matches for this event
        const matchesData = await fetchTba(`/event/${event.key}/matches`, apiKey);
        
        // Process matches
        const matches = matchesData.map(processTbaMatch);
        allMatches = [...allMatches, ...matches];
        
        // Get teams for this event
        const teamsData = await fetchTba(`/event/${event.key}/teams`, apiKey);
        
        // Process teams
        const teams = teamsData.map(processTbaTeam);
        
        // Add teams to our map (to avoid duplicates)
        teams.forEach((team: Team) => {
          if (team && team.key) {
            allTeamsMap.set(team.key, team);
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error processing event ${event.key}: ${error.message}`);
        } else {
          console.error(`Unknown error processing event ${event.key}:`, error);
        }

        // Continue with other events even if one fails
      }
    }
    
    
    return {
      events,
      matches: allMatches,
      teams: Array.from(allTeamsMap.values()),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error in getTeamEventsAndMatches: ${error.message}`);
    } else {
      console.error('Unknown error in getTeamEventsAndMatches:', error);
    }

    throw error;
  }
}

/**
 * Get all events, matches, and teams for multiple teams, including their previous events
 */
export async function getTeamsEventsAndMatches(
  teamNumbers: number[] | string[], 
  apiKey: string, 
  year: number = new Date().getFullYear()
) {

  
  try {
    let allEvents: EventData[] = [];
    let allMatches: Match[] = [];
    let allTeamsMap = new Map<string, Team>();
    
    // Ensure teamNumbers is an array
    if (!Array.isArray(teamNumbers)) {
      console.error("teamNumbers is not an array:", teamNumbers);
      throw new Error("teamNumbers must be an array");
    }
    
    // Process each team
    for (const teamNumber of teamNumbers) {
      if (!teamNumber) {
        console.warn("Skipping undefined or null team number");
        continue;
      }
      
      const teamKey = `frc${teamNumber}`;
      
      try {
        // Get all events for the team in the current year
        const eventsData = await fetchTba(`/team/${teamKey}/events/${year}`, apiKey);
        
        // Process events
        const events = eventsData.map(processTbaEvent);
        
        // Add events to our collection (avoiding duplicates)
        events.forEach((event: EventData) => {
          if (!allEvents.some(e => e.key === event.key)) {
            allEvents.push(event);
          }
        });
        
        // Get all matches and teams for each event
        for (const event of eventsData) {
          
          try {
            // Get matches for this event
            const matchesData = await fetchTba(`/event/${event.key}/matches`, apiKey);
            
            // Process matches
            const matches = matchesData.map(processTbaMatch);
            
            // Add matches to our collection (avoiding duplicates)
            matches.forEach((match: Match) => {
              if (!allMatches.some(m => m.id === match.id)) {
                allMatches.push(match);
              }
            });
            
            // Get teams for this event
            const teamsData = await fetchTba(`/event/${event.key}/teams`, apiKey);
            
            // Process teams
            const teams = teamsData.map(processTbaTeam);
            
            // Add teams to our map (to avoid duplicates)
            teams.forEach((team: Team) => {
              if (team && team.key) {
                allTeamsMap.set(team.key, team);
              }
            });
          } catch (error) {
            if (error instanceof Error) {
              console.error(`Error processing event ${event.key}: ${error.message}`);
          } else {
            console.error(`Unknown error processing event ${event.key}:`, error);
          }

            // Continue with other events even if one fails
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error processing team ${teamNumber}: ${error.message}`);
        } else {
          console.error(`Unknown error processing team ${teamNumber}:`, error);
        }

        // Continue with other teams even if one fails
      }
    }
    
    
    return {
      events: allEvents,
      matches: allMatches,
      teams: Array.from(allTeamsMap.values()),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error in getTeamsEventsAndMatches: ${error.message}`);
    } else {
      console.error('Unknown error in getTeamsEventsAndMatches:', error);
    }

    throw error;
  }
}

/**
 * Get details for a specific team
 */
export async function getTeamDetails(teamNumber: number | string, apiKey: string) {
  const teamKey = `frc${teamNumber}`;
  const teamData = await fetchTba(`/team/${teamKey}`, apiKey);
  return processTbaTeam(teamData);
}

/**
 * Get details for a specific event
 */
export async function getEventDetails(eventKey: string, apiKey: string) {
  const eventData = await fetchTba(`/event/${eventKey}`, apiKey);
  return processTbaEvent(eventData);
}

/**
 * Get matches for a specific event
 */
export async function getEventMatches(eventKey: string, apiKey: string) {
  const matchesData = await fetchTba(`/event/${eventKey}/matches`, apiKey);
  return matchesData.map(processTbaMatch);
}

/**
 * Get teams for a specific event
 */
export async function getEventTeams(eventKey: string, apiKey: string) {
  const teamsData = await fetchTba(`/event/${eventKey}/teams`, apiKey);
  return teamsData.map(processTbaTeam);
}

/**
 * Get details for a specific match
 */
export async function getMatchDetails(matchKey: string, apiKey: string) {
  const matchData = await fetchTba(`/match/${matchKey}`, apiKey);
  return processTbaMatch(matchData);
}

/**
 * Get all events for a specific year
 */
export async function getYearEvents(year: number, apiKey: string) {
  const eventsData = await fetchTba(`/events/${year}`, apiKey);
  return eventsData.map(processTbaEvent);
}

/**
 * Get district events for a specific district and year
 */
export async function getDistrictEvents(districtKey: string, year: number, apiKey: string) {
  const eventsData = await fetchTba(`/district/${districtKey}/${year}/events`, apiKey);
  return eventsData.map(processTbaEvent);
}

/**
 * Get district rankings for a specific district and year
 */
export async function getDistrictRankings(districtKey: string, year: number, apiKey: string) {
  return fetchTba(`/district/${districtKey}/${year}/rankings`, apiKey);
}

/**
 * Get team events for a specific team and year
 */
export async function getTeamEvents(teamNumber: number | string, year: number, apiKey: string) {
  const teamKey = `frc${teamNumber}`;
  const eventsData = await fetchTba(`/team/${teamKey}/events/${year}`, apiKey);
  return eventsData.map(processTbaEvent);
}

/**
 * Get team matches for a specific team and event
 */
export async function getTeamEventMatches(
  teamNumber: number | string, 
  eventKey: string, 
  apiKey: string
) {
  const teamKey = `frc${teamNumber}`;
  const matchesData = await fetchTba(`/team/${teamKey}/event/${eventKey}/matches`, apiKey);
  return matchesData.map(processTbaMatch);
}

/**
 * Get team awards for a specific team and event
 */
export async function getTeamEventAwards(
  teamNumber: number | string, 
  eventKey: string, 
  apiKey: string
) {
  const teamKey = `frc${teamNumber}`;
  return fetchTba(`/team/${teamKey}/event/${eventKey}/awards`, apiKey);
}

/**
 * Get team status for a specific team and event
 */
export async function getTeamEventStatus(
  teamNumber: number | string, 
  eventKey: string, 
  apiKey: string
) {
  const teamKey = `frc${teamNumber}`;
  return fetchTba(`/team/${teamKey}/event/${eventKey}/status`, apiKey);
}

/**
 * Get team years participated
 */
export async function getTeamYearsParticipated(teamNumber: number | string, apiKey: string) {
  const teamKey = `frc${teamNumber}`;
  return fetchTba(`/team/${teamKey}/years_participated`, apiKey);
}

/**
 * Get team districts
 */
export async function getTeamDistricts(teamNumber: number | string, apiKey: string) {
  const teamKey = `frc${teamNumber}`;
  return fetchTba(`/team/${teamKey}/districts`, apiKey);
}

/**
 * Get team robots
 */
export async function getTeamRobots(teamNumber: number | string, apiKey: string) {
  const teamKey = `frc${teamNumber}`;
  return fetchTba(`/team/${teamKey}/robots`, apiKey);
}

/**
 * Get team social media
 */
export async function getTeamSocialMedia(teamNumber: number | string, apiKey: string) {
  const teamKey = `frc${teamNumber}`;
  return fetchTba(`/team/${teamKey}/social_media`, apiKey);
}

/**
 * Get event rankings
 */
export async function getEventRankings(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/rankings`, apiKey);
}

/**
 * Get event awards
 */
export async function getEventAwards(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/awards`, apiKey);
}

/**
 * Get event district points
 */
export async function getEventDistrictPoints(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/district_points`, apiKey);
}

/**
 * Get event insights
 */
export async function getEventInsights(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/insights`, apiKey);
}

/**
 * Get event OPRs
 */
export async function getEventOPRs(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/oprs`, apiKey);
}

/**
 * Get event predictions
 */
export async function getEventPredictions(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/predictions`, apiKey);
}

/**
 * Get event alliance selections
 */
export async function getEventAllianceSelections(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/alliances`, apiKey);
}

/**
 * Get event match timeseries
 */
export async function getEventMatchTimeseries(eventKey: string, apiKey: string) {
  return fetchTba(`/event/${eventKey}/matches/timeseries`, apiKey);
}

/**
 * Get match zebra motionworks
 */
export async function getMatchZebra(matchKey: string, apiKey: string) {
  return fetchTba(`/match/${matchKey}/zebra_motionworks`, apiKey);
}

/**
 * Get match timeseries
 */
export async function getMatchTimeseries(matchKey: string, apiKey: string) {
  return fetchTba(`/match/${matchKey}/timeseries`, apiKey);
}
