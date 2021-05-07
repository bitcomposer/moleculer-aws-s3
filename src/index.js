/*
 * moleculer-aws-s3
 * Copyright (c) 2021 Kenneth Shepherd (https://github.com/bitcomposer/moleculer-aws-s3)
 * MIT Licensed
 */

"use strict";

module.exports = {

	name: "aws-s3",

	/**
	 * Default settings
	 */
	settings: {

	},

	/**
	 * Actions
	 */
	actions: {
		test(ctx) {
			return "Hello " + (ctx.params.name || "Anonymous");
		}
	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};