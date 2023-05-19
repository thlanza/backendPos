const server = require('../server');
const request = require('supertest');
const baseUrl = "http://localhost:5000/api";
const { expect, test, describe, beforeEach, afterEach } = require("@jest/globals");




describe('admin', function() {



beforeEach(async () => {
   require("../config/dbConnect");
   const resultado = await request(server)
      .get('/api/admin/seedTestes')
      .expect(200);
   const modalidade = await request(server)
      .get('/api/modalidades')
      .expect(200)
      .then(res => {
         console.log("modalidades", res.body);
         return res;
      })
   // console.log("resultado", resultado);
   // console.log("statusCode", resultado.statusCode);
   // console.log("resultado.body", resultado.body);
});

afterEach(async () => {
   require("../config/dbConnect");
   await request(server)
      .get('/api/admin/resetTestes')
});


 test("só passar", () => {

 });
    
  });
