import { v4 as uuidv4 } from "uuid";

export class ActionListItem {
  public _id: string;
  public _rev: string;
  public description: string;
  public createdAt: number;
  public updatedAt: number;
  public completedAt: number | null;
  public listOrder: number;

  constructor() {
    this._id = uuidv4();
    this._rev = undefined;
    this.description = "";
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.completedAt = null;
    this.listOrder = 0;
  }
}

export class Task extends ActionListItem {
  public notes: string;
  public dueOn: string;

  constructor() {
    super();
    this.notes = "";
    this.dueOn = "-1"; // default to undefined due date
  }
}

export class ShoppingItem extends ActionListItem {
  constructor() {
    super();
  }
}
