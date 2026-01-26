// Aquí puedes definir tus modelos de datos
// Por ejemplo, si usas una base de datos

export class ExampleModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt || new Date();
  }
}
