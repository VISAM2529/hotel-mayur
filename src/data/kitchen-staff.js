// Kitchen Staff Demo Credentials
export const kitchenStaff = [
  {
    id: 'KS001',
    username: 'chef1',
    password: 'chef123',
    name: 'Chef Rajesh Kumar',
    role: 'Head Chef',
    specialization: 'Main Course',
    experience: '15 years',
    avatar: '👨‍🍳'
  },
  {
    id: 'KS002',
    username: 'chef2',
    password: 'chef123',
    name: 'Chef Priya Sharma',
    role: 'Tandoor Chef',
    specialization: 'Breads & Tandoor',
    experience: '10 years',
    avatar: '👩‍🍳'
  },
  {
    id: 'KS003',
    username: 'cook1',
    password: 'cook123',
    name: 'Cook Amit Patel',
    role: 'Line Cook',
    specialization: 'Starters',
    experience: '5 years',
    avatar: '🧑‍🍳'
  },
  {
    id: 'KS004',
    username: 'cook2',
    password: 'cook123',
    name: 'Cook Sneha Verma',
    role: 'Line Cook',
    specialization: 'Desserts',
    experience: '3 years',
    avatar: '👩‍🍳'
  }
]

export const findKitchenStaff = (username, password) => {
  return kitchenStaff.find(
    staff => staff.username === username && staff.password === password
  )
}

export const getKitchenStaffById = (id) => {
  return kitchenStaff.find(staff => staff.id === id)
}