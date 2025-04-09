import { UpcomingMatch } from '@/types';

export const upcomingMatches: UpcomingMatch[] = [
  {
    id: "u1",
    matchNumber: 8,
    matchType: "qualification",
    redAlliance: [254, 2056, 3310],
    blueAlliance: [1114, 5268, 6328],
    scheduledTime: Date.now() + 3600000 // 1 hour from now
  },
  {
    id: "u2",
    matchNumber: 9,
    matchType: "qualification",
    redAlliance: [1678, 2767, 4613],
    blueAlliance: [118, 5268, 1114],
    scheduledTime: Date.now() + 7200000 // 2 hours from now
  },
  {
    id: "u3",
    matchNumber: 10,
    matchType: "qualification",
    redAlliance: [6328, 254, 2056],
    blueAlliance: [3310, 1678, 2767],
    scheduledTime: Date.now() + 10800000 // 3 hours from now
  },
  {
    id: "u4",
    matchNumber: 11,
    matchType: "qualification",
    redAlliance: [4613, 118, 5268],
    blueAlliance: [1114, 254, 6328],
    scheduledTime: Date.now() + 14400000 // 4 hours from now
  },
  {
    id: "u5",
    matchNumber: 12,
    matchType: "qualification",
    redAlliance: [2056, 3310, 1678],
    blueAlliance: [2767, 4613, 118],
    scheduledTime: Date.now() + 18000000 // 5 hours from now
  },
  {
    id: "u6",
    matchNumber: 13,
    matchType: "qualification",
    redAlliance: [5268, 1114, 254],
    blueAlliance: [6328, 2056, 3310],
    scheduledTime: Date.now() + 21600000 // 6 hours from now
  },
  {
    id: "u7",
    matchNumber: 14,
    matchType: "qualification",
    redAlliance: [1678, 2767, 4613],
    blueAlliance: [118, 5268, 1114],
    scheduledTime: Date.now() + 86400000 // 1 day from now
  },
  {
    id: "u8",
    matchNumber: 15,
    matchType: "qualification",
    redAlliance: [254, 6328, 2056],
    blueAlliance: [3310, 1678, 2767],
    scheduledTime: Date.now() + 86400000 + 3600000 // 1 day and 1 hour from now
  }
];