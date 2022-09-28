const { ethers } = require("hardhat");
const { exepct, assert } = require("chai");
describe("SimpleStorage", function () {
  let simpleStorageFactory;
  let simpleStorage;
  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("Should start with a favorite number of 0", async function () {
    const currentVal = await simpleStorage.retrieve();
    const expectedVal = 0;
    assert.equal(currentVal.toString(), expectedVal);
  });
  it("Should update when call store", async function () {
    const expectedValue = "7";
    const transactionRes = await simpleStorage.store(expectedValue);
    await transactionRes.wait(1);

    const curr = await simpleStorage.retrieve();
    assert(expectedValue, curr);
  });
  it("should add a person", async function () {
    const expectedVal = "James";
    const transactionRes = await simpleStorage.addPerson("James", 11);
    await transactionRes.wait(1);

    const curr = await simpleStorage.nameToFavoriteNumber("James");
    assert(curr, expectedVal);
  });
});
