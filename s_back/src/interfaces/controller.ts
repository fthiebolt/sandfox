import { Router } from "express";

export interface IController{
	router: Router;
	initializeRouter():void;
}