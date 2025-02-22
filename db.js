const faunadb = require("faunadb")
const { Create, Collection, Match, Index, Get, Ref, Select, Let, Var, Update, Map, Paginate, Lambda, Delete } = faunadb.query;

export default class Database {

	constructor(secret){
		this.client = new faunadb.Client({
			secret
		});
	}

	/**
	 * @description Returns a result object
	 * @param {String} status => The status being returned, either success or error 
	 * @param {*} data => The data being returned
	 * @returns 
	 */
	result(status, data){
		return {
			status,
			data
		}
	}

	/**
	 * @description This function breaks down and returns a consumeable fauna error
	 * @param {Object} error => The error object 
	 * @returns 
	 */
	faunaError(error){
		const { code, description } = error.requestResult.responseContent.errors[0];
		let status;

		switch(code){
			case 'unauthorized':
			case 'authentication failed':
				status = 401;
				break;
			case 'permission denied':
				status = 403;
				break;
			case 'instance not found':
				status = 404;
				break;
			case 'instance not unique':
			case 'contended transaction':
				status = 409;
				break;
			default:
				status = 500;
		}
		return { code, description, status}
	}

	async add(collection, data){
		try {
			const response = await this.client.query(
				Create(
					Collection(collection),
					{
						data
					}
				)
			);
			return this.result("success", response)
		} catch (error) {
			throw error
			return this.result("error", this.faunaError(error))
		}
	}

	async update(collection, refId, data){
		try {
			const response = this.client.query(
				Update(
					Ref(
						Collection(collection),
						refId
					),
					{
						data
					}
				)
			)
			return this.result("success", response)
		} catch (error) {
			return this.result("error", this.faunaError(error))
		}
	}

	async find(index, query){
		try {
			const response = await this.client.query(
				Let({ item: Get(Match(Index(index), query)) }, {
        refId: Select(['ref', 'id'], Var('item')),
        data: Select(['data'], Var('item'))
      })
			)
			return this.result("success", response)
		} catch (error) {
			return this.result("error", this.faunaError(error))
		}
	}

	async findAll(index, query){
		try {
	    const response = await this.client.query(
	      Select(["data"],
	        Map(
	          Paginate(Match(Index(index), query)),
	          Lambda("docRef", 
	            Let({ item: Get(Var("docRef")) }, {
	              refId: Select(['ref', 'id'], Var('item')),
	              data: Select(['data'], Var('item'))
	            })
	          )
	        )
	      )
	    )
			return this.result("success", response)
	  } catch (error) {
			return this.result("error", this.faunaError(error))
	  }
	}

	async delete(collection, refId){
		try {
			const response = await this.client.query(
				Delete(
					Ref(
						Collection(collection),
						refId
					)
				)
			)
			return this.result("success", response)
		} catch (error) {
			return this.result("error", this.faunaError(error))
		}
	}
}