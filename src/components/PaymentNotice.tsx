const PaymentNotice = () => {
  return (
    <div className="bg-red-600 p-4 mb-4 rounded-lg text-white text-center">
      <p className="font-bold">Notice: Use following Credit Card Details
        <a target="_blank" href='https://docs.stripe.com/testing?testing-method=card-numbers#cards'> (See docs):</a></p>
      <p>Card Number: 4242 4242 4242 4242</p>
      <p>Date (MM/YY): any future date</p>
      <p>CVC: any 3-digit number</p>
    </div>
  );
};

export default PaymentNotice;
