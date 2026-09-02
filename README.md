# Project Report: StudySpace — Campus Live Availability Discovery Platform

## 1. Problem Statement
In large academic campuses, finding an open, suitable place to study is often inefficient and frustrating[cite: 1]. Students frequently walk across multiple campus blocks only to discover that libraries, reading rooms, or seminar halls are already crowded to capacity[cite: 1]. 

Key challenges include:
- **Uncertainty in Seat Availability**: Lack of real-time visibility forces students to manually search room by room[cite: 1].
- **Mismatched Study Environments**: Students seeking complete silence for focused revision often end up in rooms filled with group discussions, and vice versa[cite: 1].
- **Resource Inaccessibility**: Students needing amenities such as high-speed Wi-Fi, air conditioning, or laptop power outlets have no centralized mechanism to check availability beforehand[cite: 1].
- **Operating Hour Friction**: Students often visit blocks or reading rooms without knowing whether they are currently open or closed[cite: 1].

---

## 2. Proposed Solution
StudySpace is a full-stack, real-time web application built to streamline how university students discover and secure campus study spaces[cite: 1, 2]. By providing a centralized digital view of campus blocks, the platform enables students to:
- Check real-time seat availability across all campus zones without walking across departments[cite: 1].
- Filter study locations by acoustic preferences (Silent vs. Discussion) and physical amenities (Wi-Fi, Power sockets, Air Conditioning)[cite: 1].
- Locate buildings visually using an interactive campus map that highlights room locations upon selection[cite: 1].
- Check in or out in one click using their student roll number, keeping seat metrics synchronized across all connected client devices[cite: 1].

---

## 3. Key Features
- **Real-Time Seat Synchronization**: Powered by Socket.io, check-in and check-out events update seat counters across all connected devices immediately without requiring a browser refresh[cite: 1, 2].
- **Interactive Campus Map**: An integrated visual representation of campus blocks equipped with dynamic status pins that react to search queries and capacity states[cite: 1].
- **Acoustic & Amenity Filtering**:
  - Mutually exclusive study vibes: **Silent** versus **Discussion** zones[cite: 1].
  - Multi-select facility tags: **Wi-Fi**, **Power**, and **AC**[cite: 1].
- **Capacity Sorting**: Ability to sort rooms either by campus recommendations or by **Most Seats Free** to locate available capacity during peak rush hours.
- **Campus Pulse Widget**: A dashboard metric card displaying total available seats, silent zone vacancies, and live open/closed campus status.
- **Operating Hours Enforcement**: Built-in schedule detection (9:00 AM to 4:00 PM) that dynamically displays closed indicators and disables reservations outside operating hours[cite: 1].
- **Roll Number Session Handling**: Lightweight authentication using university roll numbers, saved locally in `localStorage`, featuring automated double-booking prevention and safe checkout upon logout[cite: 1].

---

## 4. Technologies Used

### Frontend
- **React 18 (Vite)**: Component-based user interface architecture leveraging React hooks (`useState`, `useEffect`, `useRef`)[cite: 1].
- **Axios**: HTTP client configured for RESTful API communication with the backend[cite: 2].
- **Socket.io Client**: WebSocket client for event-driven real-time communication[cite: 2].
- **GSAP (GreenSock Animation Platform)**: Animation library used for card entry transitions and interactive map pin highlight pulses[cite: 1].
- **Lucide React**: Vector icon library for system indicators, amenities, and navigation elements[cite: 1].
- **Custom CSS3**: Handcrafted design system styled in an olive and charcoal palette for clear data readability and responsive layouts.

### Backend
- **Node.js & Express**: Scalable backend runtime and web application framework handling REST endpoints and request parsing[cite: 3].
- **Socket.io Engine**: WebSocket server mounted on an HTTP server to broadcast room capacity updates across connected clients[cite: 3].
- **MongoDB Atlas & Mongoose**: Cloud NoSQL database with Mongoose Object Data Modeling (ODM) for managing spaces and student occupancy records[cite: 1, 3].
- **CORS & Dotenv**: Middleware and configuration tools to enforce cross-origin policies and manage environment variables[cite: 3].

---

## 5. Implementation Details

### Architecture Flow
1. **Client Initialization**: On load, the React client queries `/api/spaces` to retrieve campus study spaces, while checking `localStorage` for any existing student session[cite: 1, 2].
2. **Real-time Event Binding**: The frontend initializes a persistent connection with the backend Socket.io server[cite: 2].
3. **Check-In / Check-Out Lifecycle**:
   - When a student checks in, a request containing the `studentId` and `spaceId` is sent to `/api/students/check-in`[cite: 1, 2].
   - The backend increments the room's occupied seat count in MongoDB, records the student's active space, and emits a `spaceUpdated` event via Socket.io[cite: 1, 3].
   - All connected browser instances receive the `spaceUpdated` event, re-rendering their counters, progress bars, and map pins instantaneously[cite: 1].
4. Interactive Mapping: Selecting any study room card triggers a targeted GSAP animation that scales and pulses the corresponding building pin on the campus map[cite: 1].

---

## 6. Future Scope
- **IoT Hardware Integration**: Deploy ultrasonic or infrared occupancy sensors under desks to track real-time occupancy automatically without requiring manual student check-ins.
- **Geofenced Verification**: Integrate GPS or campus Wi-Fi network validation (BSSID matching) so students can only check in when physically present inside the building.
- **QR-Code Seat Check-In**: Attach scannable QR stickers to individual desks to ensure precise seat allocation and eliminate forgotten manual check-outs.
- **Predictive Occupancy Analytics**: Train machine learning models on historical occupancy records to forecast peak crowding trends across exam weeks.
- **Campus Management Dashboard**: Provide administrative analytics highlighting room usage rates and peak hours to optimize lighting and air-conditioning usage across blocks.

---

## 7. References / Bibliography
- React Official Documentation: https://react.dev
- Node.js Documentation: https://nodejs.org/docs
- Express.js Guide: https://expressjs.com
- Socket.io Documentation: https://socket.io/docs/v4
- MongoDB & Mongoose Manual: https://mongoosejs.com/docs
- GreenSock (GSAP) Animation Documentation: https://gsap.com/docs/v3
