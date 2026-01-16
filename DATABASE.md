# Database

## MongoDB Schema Design

### Users Collection
- _id: ObjectId
- username: String (unique)
- email: String (unique)
- passwordHash: String
- profile: Object
- createdAt: Date

### Sessions Collection
- _id: ObjectId
- sessionTitle: String
- instructor: ObjectId (ref: Users)
- participants: Array[ObjectId]
- whiteboardData: Object
- createdAt: Date
- endedAt: Date

## Indexing Strategy

- Index on Users.username and Users.email
- Index on Sessions.instructor
- Index on Sessions.createdAt for sorting
