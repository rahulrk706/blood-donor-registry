export const BADGES = [
  {
    id: 'first_drop',
    name: 'First Drop',
    description: 'Logged your very first donation',
    icon: '🩸',
    check: (d) => d.length >= 1,
  },
  {
    id: 'triple_donor',
    name: 'Triple Donor',
    description: 'Donated blood 3 times',
    icon: '🥉',
    check: (d) => d.length >= 3,
  },
  {
    id: 'five_time',
    name: 'Five-Time Donor',
    description: 'Donated blood 5 times',
    icon: '🥈',
    check: (d) => d.length >= 5,
  },
  {
    id: 'dedicated',
    name: 'Dedicated Donor',
    description: 'Donated blood 10 times',
    icon: '🥇',
    check: (d) => d.length >= 10,
  },
  {
    id: 'hero',
    name: 'Hero Donor',
    description: 'Donated blood 25 times',
    icon: '🏆',
    check: (d) => d.length >= 25,
  },
  {
    id: 'plasma_pioneer',
    name: 'Plasma Pioneer',
    description: 'Donated plasma at least once',
    icon: '💙',
    check: (d) => d.some((x) => x.donation_type === 'plasma'),
  },
  {
    id: 'platelets_champ',
    name: 'Platelets Champion',
    description: 'Donated platelets at least once',
    icon: '💜',
    check: (d) => d.some((x) => x.donation_type === 'platelets'),
  },
  {
    id: 'power_donor',
    name: 'Power Donor',
    description: 'Donated double red cells at least once',
    icon: '❤️',
    check: (d) => d.some((x) => x.donation_type === 'double_red_cells'),
  },
  {
    id: 'all_rounder',
    name: 'All-Rounder',
    description: 'Donated all 4 blood component types',
    icon: '🌟',
    check: (d) => {
      const types = new Set(d.map((x) => x.donation_type))
      return ['whole_blood', 'plasma', 'platelets', 'double_red_cells'].every((t) => types.has(t))
    },
  },
]

export function computeBadges(donations) {
  return BADGES.map((b) => ({ ...b, earned: b.check(donations) }))
}
