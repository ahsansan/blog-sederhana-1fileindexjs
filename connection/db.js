const { Pool } = require('pg')

const dbPool = new Pool({
	// host:'ec2-34-236-87-247.compute-1.amazonaws.com' ,
	// database: 'dhr77gq8mle3s',
	// port: 5432,
	// user: 'caiydwekzxtwtk',
	// password: 'ce3349aee2d73b2d3a470211fa7329527b6e0515b3ab61c053bd740aff5349f8'
	connectionString: 'postgres://caiydwekzxtwtk:ce3349aee2d73b2d3a470211fa7329527b6e0515b3ab61c053bd740aff5349f8@ec2-34-236-87-247.compute-1.amazonaws.com:5432/dhr77gq8mle3s',
	ssl: { rejectUnauthorized: false}
})

module.exports = dbPool