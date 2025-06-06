import { ObjectId } from "mongodb";
import { connectToDatabase } from "./mongodb";

export async function getTransactions({ userId, querys }) {
  const { db } = await connectToDatabase();
  const pipeline = [
    {
      $match: {
        userId,
      },
    },
  ];
  if (querys?.filterQuery)
    pipeline.push({
      $match: {
        category: { $in: querys.filterQuery },
      },
    });

  if (querys?.sortQuery) {
    pipeline.push({
      $sort: { [querys.sortQuery]: -1 },
    });
  }

  return await db.collection("transactions").aggregate(pipeline).toArray();
}

export async function getTransactionsByPeriod({ userId, start, end }) {
  const { db } = await connectToDatabase();
  const startDate = new Date(start);
  const startPeriod = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const endDate = new Date(end);
  const endPeriod = new Date(
    Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59,
      999
    )
  );

  return await db
    .collection("transactions")
    .find({
      userId,
      date: {
        $gte: startPeriod,
        $lte: endPeriod,
      },
    })
    .toArray();
}

export async function addTransaction({
  description,
  category,
  date,
  sum,
  userId,
}) {
  const { db } = await connectToDatabase();

  const newDate = new Date(date);

  const transaction = {
    userId,
    description,
    category,
    date: new Date(
      Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    ),
    sum,
  };

  return await db.collection("transactions").insertOne(transaction);
}

export async function updateTransaction({
  description,
  category,
  date,
  sum,
  userId,
  id,
}) {
  const { db } = await connectToDatabase();

  const objId = new ObjectId(id);

  const isExist = !!(await db
    .collection("transactions")
    .findOne({ userId, _id: objId }));

  if (!isExist) return false;

  const newDate = new Date(date);

  return await db.collection("transactions").updateOne(
    { _id: objId, userId },
    {
      $set: {
        category,
        date: new Date(
          Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
        ),
        description,
        sum,
      },
    }
  );
}

export async function deleteTransaction({ id, userId }) {
  const { db } = await connectToDatabase();

  const objId = new ObjectId(id);

  const isExist = !!(await db
    .collection("transactions")
    .findOne({ userId, _id: objId }));

  if (!isExist) return false;

  return await db.collection("transactions").deleteOne({ _id: objId, userId });
}
