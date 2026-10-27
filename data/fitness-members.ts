/**
 * Oddworks Analytics – Fitness Behaviour Demo
 *
 * 100 synthetic members.
 * Three consecutive 30-day periods after membership start.
 * No real Fitness First member data.
 */

export type FitnessMember = {
  id: string
  name: string
  club: string
  startDate: string
  visitsByPeriod: [number, number, number]
}

const clubs = [
  "Demo Club 01",
  "Demo Club 02",
  "Demo Club 03",
  "Demo Club 04",
  "Demo Club 05",
  "Demo Club 06",
  "Demo Club 07",
  "Demo Club 08"
]

// Illustrative training patterns.
// Status will be calculated separately, not stored in the data.
const patterns = [
  [12, 12, 11],
  [8, 8, 8],
  [4, 4, 4],
  [6, 6, 5],

  [12, 10, 8],
  [8, 7, 5],
  [6, 5, 4],
  [4, 4, 3],

  [12, 8, 3],
  [10, 6, 1],
  [8, 4, 0],
  [6, 3, 1]
] as const

export const fitnessMembers: FitnessMember[] =
  Array.from({ length: 100 }, (_, index): FitnessMember => {
    const pattern = patterns[index % patterns.length]

    // Fixed historical cohort with completed 90-day windows.
    const startDate = new Date(
      Date.UTC(2026, 5, 1 + (index % 45))
    ).toISOString().slice(0, 10)

    return {
      id: `MEM-${String(index + 1).padStart(3, "0")}`,
      name: `Member ${String(index + 1).padStart(3, "0")}`,
      club: clubs[
        ((index % patterns.length) +
          Math.floor(index / patterns.length)) % clubs.length
      ],
      startDate,
      visitsByPeriod: [
        pattern[0],
        pattern[1],
        pattern[2]
      ]
    }
  })
