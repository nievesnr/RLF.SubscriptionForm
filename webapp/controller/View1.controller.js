sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";
	
	return Controller.extend("SubscriptionForm.SubscriptionForm.controller.View1", {
		
		onInit: function () {
			
			var oModel = new JSONModel();
			oModel.loadData(sap.ui.require.toUrl("SubscriptionForm/SubscriptionForm/model/subscriptionModel.json"));
			this.getView().setModel(oModel);
		},
	
		//Se asegura de que las peticiones vengan de nuestro dominio
		_fetchToken: function() {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},
		
		//Llama al servicio workflow para generar una instancia
		_startInstance: function (token) {
 
			var oModel = this.getView().getModel();
			var subsNameInputValue = oModel.getProperty("/SubsName");
			var subsSurnameInputValue = oModel.getProperty("/SubsSurname");
			var subsEmailInputValue = oModel.getProperty("/SubsEmail");
			
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/workflow-instances",
				method: "POST",
				async: false,
				contentType: "application/json",
				headers: {
					"X-CSRF-Token": token
				},
				data: JSON.stringify({
					"definitionId": "wfsubscriptionform",
					"context": {
						"SubsName": subsNameInputValue,
						"SubsSurname": subsSurnameInputValue,
						"SubsEmail": subsEmailInputValue
					}
				}),
				success: function (result, xhr, data){
					oModel.setProperty("/result", JSON.stringify(result, null, 4));
					
					if(result.status === "RUNNING"){
						MessageToast.show("Tu suscripción se ha realizado correctamente");
					}else{
						MessageToast.show("No se ha podido realizar tu suscripción");
					}
				}
			});
		},
		
		onSendPress: function (oEvent){
			
			var token = this._fetchToken();
			this._startInstance(token);
		}
	});
});