import { AdjustmentNoteDomainMassive } from "../massive/adjustmentNoteMassive.domain";
import {
  getLastUpload,
  getMassiveHash,
  saveMassiveHash,
} from "../../repository/adjustmentNoteMassive/adjustmentNoteMassive.repository";
import { AdjustmentNoteMassiveService } from "../../service/massive/adjustmentNoteOrdersMassive.service";
import { GenerateMultiviewXlsx } from "../../../../helpers/xlsx/xlsx";
import crypto from "crypto";
import { AppError } from "vanti-utils/lib";
import { AdjustmentNoteMassive, OrdersToSaveRelation, OrderValidationStatus } from "../../type/adjustmentNoteMassive";

jest.mock(
  "../../repository/adjustmentNoteMassive/adjustmentNoteMassive.repository",
  () => ({
    getLastUpload: jest.fn(),
    saveMassiveHash: jest.fn(),
    getMassiveHash: jest.fn(),
  })
);
jest.mock("../../service/massive/adjustmentNoteOrdersMassive.service");
jest.mock("../../../../helpers/xlsx/xlsx", () => ({
  GenerateMultiviewXlsx: jest.fn(),
}));

describe("AdjustmentNoteDomainMassive", () => {
  let domain: AdjustmentNoteDomainMassive;

  beforeEach(() => {
    domain = new AdjustmentNoteDomainMassive();
    jest.clearAllMocks();
  });

  it("debe llamar a getLastUpload y retornar el último registro", async () => {
    const mockData = {
      createdAt: "2024-03-25T16:00:00.000Z",
      updatedAt: "2024-03-25T16:30:00.000Z",
    };
    (getLastUpload as jest.Mock).mockResolvedValue(mockData);

    const result = await domain.getLastUpload();

    expect(getLastUpload).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockData);
  });

  it("debe manejar errores cuando getLastUpload falla", async () => {
    (getLastUpload as jest.Mock).mockRejectedValue(
      new Error("Error al obtener los datos")
    );

    await expect(domain.getLastUpload()).rejects.toThrow(
      "Error al obtener los datos"
    );
    expect(getLastUpload).toHaveBeenCalledTimes(1);
  });

  it("debe retornar un archivo con base64 y filename cuando existen órdenes", async () => {
    const mockOrders = [{ documentNumber: "123" }, { documentNumber: "456" }];

    const mockHashData = { id: "hashId" };

    (AdjustmentNoteMassiveService as jest.Mock).mockImplementation(() => ({
      getMassiveOrdersToFile: jest.fn().mockResolvedValue(mockOrders),
    }));

    domain.getFileHashMassive = jest.fn().mockResolvedValue(mockHashData);
    (saveMassiveHash as jest.Mock).mockResolvedValue({ id: "hashId" });
    (GenerateMultiviewXlsx as jest.Mock).mockResolvedValue(
      "base64string"
    );

    const result = await domain.getOrderMassiveFile();

    expect(result).toHaveProperty("fileName");
    expect(result).toHaveProperty("base64", "base64string");
    expect(saveMassiveHash).toHaveBeenCalledWith(mockHashData);
    expect(GenerateMultiviewXlsx).toHaveBeenCalled();
  });

  it("debe retornar filename y base64 vacío cuando no existan órdenes", async () => {
    (AdjustmentNoteMassiveService as jest.Mock).mockImplementation(() => ({
      getMassiveOrdersToFile: jest.fn().mockResolvedValue([]),
    }));

    const result = await domain.getOrderMassiveFile();

    expect(result).toEqual({
      base64: "",
      fileName: "orders not found",
    });
  });

  it("debe manejar error cuando getMassiveOrdersToFile falla", async () => {
    (AdjustmentNoteMassiveService as jest.Mock).mockImplementation(() => ({
      getMassiveOrdersToFile: jest
        .fn()
        .mockRejectedValue(new Error("Error al obtener órdenes")),
    }));

    await expect(domain.getOrderMassiveFile()).rejects.toThrow(
      "Error al obtener órdenes"
    );
  });

  describe("getFileHashMassive", () => {
    it("debe generar un hash correcto con datos numéricos", async () => {
      const fileData = ["100", "200", "300"];
      const fileName = "archivo.xlsx";

      const result = await domain.getFileHashMassive(fileData, fileName);

      const expectedSum = 600;
      const expectedHash = crypto
        .createHash("sha256")
        .update(`${expectedSum}`)
        .digest("hex");

      expect(result).toEqual({
        fileName,
        hash: expectedHash,
        status: "CREATED",
      });
    });

    it("debe ignorar valores no numéricos y calcular correctamente el hash", async () => {
      const fileData = ["100", "abc", "200", "xyz"];
      const fileName = "archivo.xlsx";

      const result = await domain.getFileHashMassive(fileData, fileName);

      const expectedSum = 300; // Solo 100 + 200
      const expectedHash = crypto
        .createHash("sha256")
        .update(`${expectedSum}`)
        .digest("hex");

      expect(result).toEqual({
        fileName,
        hash: expectedHash,
        status: "CREATED",
      });
    });

    it("debe retornar hash de '0' cuando el array está vacío", async () => {
      const fileData: string[] = [];
      const fileName = "archivo.xlsx";

      const result = await domain.getFileHashMassive(fileData, fileName);

      const expectedHash = crypto
        .createHash("sha256")
        .update("0")
        .digest("hex");

      expect(result).toEqual({
        fileName,
        hash: expectedHash,
        status: "CREATED",
      });
    });
  });

  describe("isInvalidValue", () => {
    let domain: AdjustmentNoteDomainMassive;

    beforeEach(() => {
      domain = new AdjustmentNoteDomainMassive();
    });

    it("debe retornar true si el valor es null", () => {
      expect((domain as any).isInvalidValue(null)).toBe(true);
    });

    it("debe retornar true si el valor es undefined", () => {
      expect((domain as any).isInvalidValue(undefined)).toBe(true);
    });

    it("debe retornar true si el valor es el número 0", () => {
      expect((domain as any).isInvalidValue(0)).toBe(true);
    });

    it("debe retornar true si el valor es un string vacío", () => {
      expect((domain as any).isInvalidValue("")).toBe(true);
    });

    it("debe retornar true si el valor es un string de espacios", () => {
      expect((domain as any).isInvalidValue("   ")).toBe(true);
    });

    it("debe retornar true si el valor es un string '0'", () => {
      expect((domain as any).isInvalidValue("0")).toBe(true);
    });

    it("debe retornar false si el valor es un número distinto de 0", () => {
      expect((domain as any).isInvalidValue(5)).toBe(false);
    });

    it("debe retornar false si el valor es un string válido", () => {
      expect((domain as any).isInvalidValue("Hola")).toBe(false);
    });

    it("debe retornar false si el valor es un objeto", () => {
      expect((domain as any).isInvalidValue({})).toBe(false);
    });

    it("debe retornar false si el valor es un array", () => {
      expect((domain as any).isInvalidValue([])).toBe(false);
    });
  });

  describe("getHashByFileName", () => {
    let domain: AdjustmentNoteDomainMassive;

    beforeEach(() => {
      domain = new AdjustmentNoteDomainMassive();
      jest.clearAllMocks();
    });

    it("debe retornar el hash cuando existe en la base de datos", async () => {
      const mockHash = {
        fileName: "archivo.xlsx",
        hash: "abc123",
        status: "CREATED",
      };
      (getMassiveHash as jest.Mock).mockResolvedValue(mockHash);

      const result = await (domain as any).getHashByFileName("archivo.xlsx");

      expect(getMassiveHash).toHaveBeenCalledWith("archivo.xlsx");
      expect(result).toEqual(mockHash);
    });

    it("debe lanzar un AppError cuando no se encuentra el hash", async () => {
      (getMassiveHash as jest.Mock).mockResolvedValue(null);

      await expect(
        (domain as any).getHashByFileName("archivo.xlsx")
      ).rejects.toThrow(AppError);
      await expect(
        (domain as any).getHashByFileName("archivo.xlsx")
      ).rejects.toThrow("No se encontró hash para el archivo archivo.xlsx");

      expect(getMassiveHash).toHaveBeenCalledWith("archivo.xlsx");
    });
  });

  describe("validateHash", () => {
    let domain: AdjustmentNoteDomainMassive;

    beforeEach(() => {
      domain = new AdjustmentNoteDomainMassive();
      jest.clearAllMocks();
    });

    it("debe retornar true cuando los hashes coinciden", async () => {
      const mockFileData = [{ documentNumberAdjustmentNote: "123" }];
      const fileName = "archivo.xlsx";

      const mockHash = {
        fileName: fileName,
        hash: "abc123",
        status: "CREATED",
      };

      jest
        .spyOn(domain as any, "getFileHashMassive")
        .mockResolvedValue(mockHash);
      jest
        .spyOn(domain as any, "getHashByFileName")
        .mockResolvedValue(mockHash);

      const result = await (domain as any).validateHash(mockFileData, fileName);

      expect((domain as any).getFileHashMassive).toHaveBeenCalledWith(
        ["123"],
        fileName
      );
      expect((domain as any).getHashByFileName).toHaveBeenCalledWith("archivo");
      expect(result).toBe(true);
    });

    it("debe retornar false y loguear un error cuando los hashes no coinciden", async () => {
      const mockFileData = [{ documentNumberAdjustmentNote: "123" }];
      const fileName = "archivo.xlsx";

      const hashGenerated = {
        fileName: fileName,
        hash: "hash1",
        status: "CREATED",
      };
      const hashMongo = {
        fileName: fileName,
        hash: "hash2",
        status: "CREATED",
      };

      jest
        .spyOn(domain as any, "getFileHashMassive")
        .mockResolvedValue(hashGenerated);
      jest
        .spyOn(domain as any, "getHashByFileName")
        .mockResolvedValue(hashMongo);

      const logErrorSpy = jest.spyOn(log, "error").mockImplementation();

      const result = await (domain as any).validateHash(mockFileData, fileName);

      expect((domain as any).getFileHashMassive).toHaveBeenCalledWith(
        ["123"],
        fileName
      );
      expect((domain as any).getHashByFileName).toHaveBeenCalledWith("archivo");
      expect(logErrorSpy).toHaveBeenCalledWith({
        message: `El archivo ${fileName} ha sido modificado`,
      });
      expect(result).toBe(false);
    });
  });

  describe("AdjustmentNoteDomainMassive - _convertBufferToData", () => {
    let domain: AdjustmentNoteDomainMassive;

    beforeEach(() => {
      domain = new AdjustmentNoteDomainMassive();
    });

    it("debe convertir un buffer válido a datos", async () => {
      const data = [
        { "PEDIDO ZP12": "123", "NOTA DE AJUSTE": "456" },
        { "PEDIDO ZP12": "789", "NOTA DE AJUSTE": "012" },
      ];
      const buffer = Buffer.from(JSON.stringify(data));

      const result = await (domain as any)._convertBufferToData(buffer);

      expect(result).toEqual([
        { documentNumber: "123", documentNumberAdjustmentNote: "456" },
        { documentNumber: "789", documentNumberAdjustmentNote: "012" },
      ]);
    });

    it("debe lanzar error si un registro tiene NOTA DE AJUSTE inválido", async () => {
      const data = [{ "PEDIDO ZP12": "123", "NOTA DE AJUSTE": "" }];
      const buffer = Buffer.from(JSON.stringify(data));

      await expect(
        (domain as any)._convertBufferToData(buffer)
      ).rejects.toThrow(
        "Todos los pedidos deben estar asociados a sus nota de ajuste correspondientes, por favor verifique el archivo"
      );
    });

    it("debe lanzar un error si el JSONStream falla", async () => {
      // Forzar un buffer mal formado
      const invalidBuffer = Buffer.from("{ invalid json");

      await expect(
        (domain as any)._convertBufferToData(invalidBuffer)
      ).rejects.toThrow("Error al leer archivo de settlement");
    });
  });
});

describe("validateOrders", () => {
  let domain: AdjustmentNoteDomainMassive;
  let validateMassiveOrdersMock: jest.Mock;

  const fileData = [
    { documentNumber: "123", documentNumberAdjustmentNote: "456" },
    { documentNumber: "789", documentNumberAdjustmentNote: "012" },
  ];

  beforeEach(() => {
    domain = new AdjustmentNoteDomainMassive();

    validateMassiveOrdersMock = jest.fn().mockResolvedValue(OrderValidationStatus.VALID);

    // Mock de la clase AdjustmentNoteMassiveService
    (AdjustmentNoteMassiveService as jest.Mock).mockImplementation(() => ({
      validateMassiveOrders: validateMassiveOrdersMock,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe mapear correctamente y llamar a validateMassiveOrders", async () => {
    const result = await (domain as any).validateOrders(fileData);

    expect(validateMassiveOrdersMock).toHaveBeenCalledWith({
      ordersVantilisto: ["123", "789"],
      ordersMassively: ["456", "012"],
    });

    expect(result).toBe(OrderValidationStatus.VALID);
  });

  it("debe retornar el status correcto si el servicio retorna un valor diferente", async () => {
    validateMassiveOrdersMock.mockResolvedValue(OrderValidationStatus.FILE_ERROR);

    const result = await (domain as any).validateOrders(fileData);

    expect(result).toBe(OrderValidationStatus.FILE_ERROR);
  });
});

describe("chunksToValidate", () => {
  let domain: AdjustmentNoteDomainMassive;
  let validateOrdersMock: jest.Mock;

  const fileData: AdjustmentNoteMassive[] = [
    { documentNumber: "1", documentNumberAdjustmentNote: "A" },
    { documentNumber: "2", documentNumberAdjustmentNote: "B" },
    { documentNumber: "3", documentNumberAdjustmentNote: "C" },
    { documentNumber: "4", documentNumberAdjustmentNote: "D" },
  ];

  beforeEach(() => {
    domain = new AdjustmentNoteDomainMassive();

    validateOrdersMock = jest.fn().mockResolvedValue(OrderValidationStatus.VALID);

    // Sobreescribir el método validateOrders en la instancia
    (domain as any).validateOrders = validateOrdersMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar VALID si todos los chunks son válidos", async () => {
    const result = await (domain as any).chunksToValidate(fileData, 2);

    expect(validateOrdersMock).toHaveBeenCalledTimes(2);
    expect(validateOrdersMock).toHaveBeenCalledWith([
      { documentNumber: "1", documentNumberAdjustmentNote: "A" },
      { documentNumber: "2", documentNumberAdjustmentNote: "B" },
    ]);
    expect(validateOrdersMock).toHaveBeenCalledWith([
      { documentNumber: "3", documentNumberAdjustmentNote: "C" },
      { documentNumber: "4", documentNumberAdjustmentNote: "D" },
    ]);
    expect(result).toBe(OrderValidationStatus.VALID);
  });

  it("debe detenerse y retornar error si un chunk no es válido", async () => {
    validateOrdersMock
      .mockResolvedValueOnce(OrderValidationStatus.VALID)
      .mockResolvedValueOnce(OrderValidationStatus.FILE_ERROR);

    const result = await (domain as any).chunksToValidate(fileData, 2);

    expect(validateOrdersMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(OrderValidationStatus.FILE_ERROR);
  });

  it("debe validar todo en un solo chunk si chunkSize es mayor al length", async () => {
    const result = await (domain as any).chunksToValidate(fileData, 10);

    expect(validateOrdersMock).toHaveBeenCalledTimes(1);
    expect(validateOrdersMock).toHaveBeenCalledWith(fileData);
    expect(result).toBe(OrderValidationStatus.VALID);
  });
});

describe("saveMassiveOrderRelation", () => {
  let domain: AdjustmentNoteDomainMassive;
  const mockSaveMassiveOrderRelation = jest.fn();

  const sampleData: AdjustmentNoteMassive[] = [
    { documentNumber: "100", documentNumberAdjustmentNote: "A100" },
    { documentNumber: "200", documentNumberAdjustmentNote: "B200" }
  ];

  beforeEach(() => {
    domain = new AdjustmentNoteDomainMassive();

    // Simula el método del servicio
    (AdjustmentNoteMassiveService as jest.Mock).mockImplementation(() => {
      return {
        saveMassiveOrderRelation: mockSaveMassiveOrderRelation
      };
    });

    mockSaveMassiveOrderRelation.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe mapear correctamente los datos y llamar al servicio con ellos", async () => {
    await (domain as any).saveMassiveOrderRelation(sampleData);

    const expectedMappedData: OrdersToSaveRelation[] = [
      { vantilisto: "100", adjusment_note: "A100" },
      { vantilisto: "200", adjusment_note: "B200" }
    ];

    expect(mockSaveMassiveOrderRelation).toHaveBeenCalledTimes(1);
    expect(mockSaveMassiveOrderRelation).toHaveBeenCalledWith(expectedMappedData);
  });

  it("debe funcionar correctamente incluso si el servicio retorna undefined", async () => {
    mockSaveMassiveOrderRelation.mockResolvedValueOnce(undefined);
    await expect((domain as any).saveMassiveOrderRelation(sampleData)).resolves.toBeUndefined();
    expect(mockSaveMassiveOrderRelation).toHaveBeenCalled();
  });
});

describe("chunksToSave", () => {
  let domain: AdjustmentNoteDomainMassive;
  const mockSaveMassiveOrderRelation = jest.fn();

  const sampleData: AdjustmentNoteMassive[] = [
    { documentNumber: "1", documentNumberAdjustmentNote: "A1" },
    { documentNumber: "2", documentNumberAdjustmentNote: "A2" },
    { documentNumber: "3", documentNumberAdjustmentNote: "A3" },
    { documentNumber: "4", documentNumberAdjustmentNote: "A4" },
  ];

  beforeEach(() => {
    domain = new AdjustmentNoteDomainMassive();

    // Sobrescribimos directamente el método privado usando cast
    (domain as any).saveMassiveOrderRelation = mockSaveMassiveOrderRelation;
    mockSaveMassiveOrderRelation.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe llamar a saveMassiveOrderRelation por cada chunk", async () => {
    await (domain as any).chunksToSave(sampleData, 2);

    expect(mockSaveMassiveOrderRelation).toHaveBeenCalledTimes(2);
    expect(mockSaveMassiveOrderRelation).toHaveBeenNthCalledWith(1, [
      { documentNumber: "1", documentNumberAdjustmentNote: "A1" },
      { documentNumber: "2", documentNumberAdjustmentNote: "A2" },
    ]);
    expect(mockSaveMassiveOrderRelation).toHaveBeenNthCalledWith(2, [
      { documentNumber: "3", documentNumberAdjustmentNote: "A3" },
      { documentNumber: "4", documentNumberAdjustmentNote: "A4" },
    ]);
  });

  it("no debe fallar si la lista está vacía", async () => {
    await expect((domain as any).chunksToSave([], 2)).resolves.toBeUndefined();
    expect(mockSaveMassiveOrderRelation).not.toHaveBeenCalled();
  });
});

describe("saveMassiveOrders", () => {
  let domain: AdjustmentNoteDomainMassive;
  const mockConvertBufferToData = jest.fn();
  const mockValidateHash = jest.fn();
  const mockChunksToValidate = jest.fn();
  const mockChunksToSave = jest.fn();

  const validData: AdjustmentNoteMassive[] = [
    { documentNumber: "1", documentNumberAdjustmentNote: "A1" },
    { documentNumber: "2", documentNumberAdjustmentNote: "A2" },
  ];

  beforeEach(() => {
    domain = new AdjustmentNoteDomainMassive();

    (domain as any)._convertBufferToData = mockConvertBufferToData;
    (domain as any).validateHash = mockValidateHash;
    (domain as any).chunksToValidate = mockChunksToValidate;
    (domain as any).chunksToSave = mockChunksToSave;

    (domain as any).quantityOrdersToChunk = 2;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar FILE_ERROR si el hash no es válido", async () => {
    mockConvertBufferToData.mockResolvedValue(validData);
    mockValidateHash.mockResolvedValue(false);

    const result = await domain.saveMassiveOrders(Buffer.from("fake"), "file.csv");
    expect(result).toEqual({ save: false, responseType: OrderValidationStatus.FILE_ERROR });
    expect(mockChunksToValidate).not.toHaveBeenCalled();
    expect(mockChunksToSave).not.toHaveBeenCalled();
  });

  it("debe retornar EMPTY_ORDES si los datos filtrados quedan vacíos", async () => {
    const emptyData = [{ documentNumber: "", documentNumberAdjustmentNote: "A1" }];
    mockConvertBufferToData.mockResolvedValue(emptyData);
    mockValidateHash.mockResolvedValue(true);

    const result = await domain.saveMassiveOrders(Buffer.from("fake"), "file.csv");
    expect(result).toEqual({ save: false, responseType: OrderValidationStatus.EMPTY_ORDES });
  });

  it("debe retornar EMPTY_ORDES si chunksToValidate devuelve EMPTY_ORDES", async () => {
    mockConvertBufferToData.mockResolvedValue(validData);
    mockValidateHash.mockResolvedValue(true);
    mockChunksToValidate.mockResolvedValue(OrderValidationStatus.EMPTY_ORDES);

    const result = await domain.saveMassiveOrders(Buffer.from("fake"), "file.csv");
    expect(result).toEqual({ save: false, responseType: OrderValidationStatus.EMPTY_ORDES });
  });

  it("debe retornar error si chunksToValidate devuelve un error distinto a VALID", async () => {
    mockConvertBufferToData.mockResolvedValue(validData);
    mockValidateHash.mockResolvedValue(true);
    mockChunksToValidate.mockResolvedValue(OrderValidationStatus.RELATION_EXIST);

    const result = await domain.saveMassiveOrders(Buffer.from("fake"), "file.csv");
    expect(result).toEqual({ save: false, responseType: OrderValidationStatus.RELATION_EXIST });
  });

  it("debe retornar success si todo es válido", async () => {
    mockConvertBufferToData.mockResolvedValue(validData);
    mockValidateHash.mockResolvedValue(true);
    mockChunksToValidate.mockResolvedValue(OrderValidationStatus.VALID);
    mockChunksToSave.mockResolvedValue(undefined);

    const result = await domain.saveMassiveOrders(Buffer.from("fake"), "file.csv");

    expect(result).toEqual({ save: true, responseType: OrderValidationStatus.VALID });
    expect(mockChunksToSave).toHaveBeenCalledWith(validData, 2);
  });
});