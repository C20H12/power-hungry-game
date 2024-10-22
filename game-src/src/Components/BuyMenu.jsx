function BuyMenu({ title, closeFunc, itemList, availableItemList, ownedItemList, money, buyHandler }) {
  return (
    <div className="buy-items">
      <h2>{title}</h2>
      <img src="/ui/cross.jpg" alt="close" className="close-button" onClick={closeFunc} />
      <div>
        {itemList.map(item => {
          const hasEnoughMoney = money >= item.cost;
          const isAlreadyOwned = ownedItemList.find(ownedItem => item.id == ownedItem.id);
          return (
            <div key={item.id} className="item">
              <img
                src={availableItemList.includes(item.id) ? `/assets/${item.image}` : "/assets/lock.jpg"}
                alt={item.name}
                className="icon"
              />
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              {availableItemList.includes(item.id) && (
                <button disabled={!hasEnoughMoney || isAlreadyOwned} onClick={() => buyHandler(item)}>
                  {isAlreadyOwned
                    ? "Already owned"
                    : !hasEnoughMoney
                    ? "Not enough money"
                    : `Buy for $${item.cost}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BuyMenu;