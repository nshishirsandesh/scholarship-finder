export interface IndianState {
  name: string;
  code: string;
  isUT: boolean;
  districts: string[];
}

export const INDIAN_STATES: IndianState[] = [
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    isUT: false,
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Anantapur', 'Nellore', 'Kakinada'],
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    isUT: false,
    districts: ['Itanagar', 'Tawang', 'Pasighat', 'Ziro'],
  },
  {
    name: 'Assam',
    code: 'AS',
    isUT: false,
    districts: ['Guwahati (Kamrup)', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur'],
  },
  {
    name: 'Bihar',
    code: 'BR',
    isUT: false,
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    isUT: false,
    districts: ['Raipur', 'Bhilai / Durg', 'Bilaspur', 'Korba', 'Rajnandgaon'],
  },
  {
    name: 'Goa',
    code: 'GA',
    isUT: false,
    districts: ['North Goa', 'South Goa'],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    isUT: false,
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'],
  },
  {
    name: 'Haryana',
    code: 'HR',
    isUT: false,
    districts: ['Gurugram', 'Faridabad', 'Ambala', 'Hisar', 'Rohtak', 'Karnal', 'Panipat'],
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    isUT: false,
    districts: ['Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan', 'Kullu'],
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    isUT: false,
    districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    isUT: false,
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru (Dakshina Kannada)', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Shivamogga', 'Udupi'],
  },
  {
    name: 'Kerala',
    code: 'KL',
    isUT: false,
    districts: ['Thiruvananthapuram', 'Kochi (Ernakulam)', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Kottayam'],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    isUT: false,
    districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    isUT: false,
    districts: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Kolhapur', 'Solapur'],
  },
  {
    name: 'Manipur',
    code: 'MN',
    isUT: false,
    districts: ['Imphal East', 'Imphal West', 'Churachandpur', 'Thoubal'],
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    isUT: false,
    districts: ['East Khasi Hills (Shillong)', 'West Garo Hills (Tura)', 'Ri-Bhoi'],
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    isUT: false,
    districts: ['Aizawl', 'Lunglei', 'Champhai'],
  },
  {
    name: 'Nagaland',
    code: 'NL',
    isUT: false,
    districts: ['Kohima', 'Dimapur', 'Mokokchung'],
  },
  {
    name: 'Odisha',
    code: 'OD',
    isUT: false,
    districts: ['Bhubaneswar (Khurda)', 'Cuttack', 'Rourkela (Sundargarh)', 'Berhampur (Ganjam)', 'Sambalpur'],
  },
  {
    name: 'Punjab',
    code: 'PB',
    isUT: false,
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)'],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    isUT: false,
    districts: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Ajmer', 'Bikaner'],
  },
  {
    name: 'Sikkim',
    code: 'SK',
    isUT: false,
    districts: ['East Sikkim (Gangtok)', 'West Sikkim', 'South Sikkim', 'North Sikkim'],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    isUT: false,
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode'],
  },
  {
    name: 'Telangana',
    code: 'TS',
    isUT: false,
    districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Rangareddy', 'Medchal-Malkajgiri'],
  },
  {
    name: 'Tripura',
    code: 'TR',
    isUT: false,
    districts: ['West Tripura (Agartala)', 'Gomati', 'South Tripura'],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    isUT: false,
    districts: ['Lucknow', 'Kanpur', 'Varanasi', 'Noida (Gautam Buddha Nagar)', 'Ghaziabad', 'Agra', 'Prayagraj', 'Meerut', 'Gorakhpur', 'Bareilly', 'Aligarh'],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    isUT: false,
    districts: ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar', 'Roorkee'],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    isUT: false,
    districts: ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly', 'Darjeeling', 'Siliguri', 'Paschim Bardhaman'],
  },
  {
    name: 'Delhi (NCT)',
    code: 'DL',
    isUT: true,
    districts: ['Central Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Dwarka'],
  },
  {
    name: 'Jammu and Kashmir',
    code: 'JK',
    isUT: true,
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  },
  {
    name: 'Ladakh',
    code: 'LA',
    isUT: true,
    districts: ['Leh', 'Kargil'],
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    isUT: true,
    districts: ['Chandigarh'],
  },
  {
    name: 'Puducherry',
    code: 'PY',
    isUT: true,
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  },
];
