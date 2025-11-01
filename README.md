# FissionPay 💳

**Split bills and receive payments across chains**

FissionPay is a cross-chain payment application that enables merchants to split bills and receive payments from any blockchain network. Built with Next.js and the Interchain ecosystem, it supports payments from Cosmos and EVM chains using Skip Protocol for seamless cross-chain transfers.

## 🌟 Features

- **Cross-Chain Payments**: Accept payments from Cosmos and EVM chains (like Optimism, Ethereum, etc.)
- **Bill Splitting**: Create bills with customizable amounts
- **Multiple Wallet Support**: 
  - Cosmos wallets (Keplr, Leap)
  - EVM wallets (Metamask)
- **QR Code Generation**: Share payment links easily via QR codes
- **Real-Time Updates**: Track bill status and remaining amounts in real-time
- **Skip Protocol Integration**: Leverages Skip Protocol for seamless cross-chain swaps

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9.7.0+ (recommended) or npm/yarn
- A web3 wallet installed:
  - [Keplr](https://www.keplr.app/) for Cosmos chains
  - [Metamask](https://metamask.io/) for EVM chains

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FissionPay
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   or
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SKIP_API_URL=https://api.skip.money
   NEXT_PUBLIC_SKIP_API_KEY=your_skip_api_key_here
   ```
   
   > **Note**: Get your Skip API key from [Skip Protocol](https://skip.money/)

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   
   or
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### For Merchants

1. **Access the Merchant Dashboard**
   - Click "Merchant Dashboard" on the homepage
   - Or navigate to `/merchant`

2. **Connect Your Wallet**
   - Connect your Keplr wallet (required for receiving payments on Noble chain)
   - The app will auto-connect if you've connected before

3. **Create a Bill**
   - Enter the total amount in USDC
   - Click "Create Bill"
   - A QR code and payment link will be generated

4. **Share the Payment Link**
   - Share the QR code or payment link with customers
   - Track payment status in real-time

### For Customers (Payers)

1. **Open the Payment Link**
   - Scan the QR code or open the payment link
   - You'll see the bill details and remaining amount

2. **Connect Your Wallet**
   - Choose your preferred wallet:
     - **Keplr**: For Cosmos chains (Osmosis, Celestia, etc.)
     - **Metamask**: For EVM chains (Optimism, Ethereum, etc.)

3. **Select Source Chain & Token** (for Cosmos wallets)
   - Choose which Cosmos chain and token you want to pay with
   - The app will automatically enable the chain in Keplr

4. **Choose Payment Amount**
   - Select a percentage (25%, 50%, 75%, 100%) or enter a custom amount
   - Click "Calculate Route" to see the cross-chain route

5. **Execute Payment**
   - Review the route details
   - Click "Pay Now" to execute the cross-chain payment
   - Confirm the transaction in your wallet

6. **Payment Confirmation**
   - Wait for the transaction to complete
   - The bill will automatically update with your payment

## 🏗️ Project Structure

```
FissionPay/
├── components/          # React components
│   ├── common/         # Shared components (Header, Footer, Layout)
│   └── wallet/         # Wallet-related components
├── config/             # Configuration files
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   └── bills/      # Bill management endpoints
│   ├── merchant.tsx    # Merchant dashboard
│   └── pay/            # Payment pages
├── public/             # Static assets
├── styles/             # Global styles
├── utils/              # Utility functions
│   ├── skipGo.ts       # Skip Protocol integration
│   └── wallet.ts       # Wallet utilities
└── types/              # TypeScript type definitions
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 13](https://nextjs.org/)
- **Language**: TypeScript
- **UI Library**: [Interchain UI](https://github.com/hyperweb.io/interchain-ui)
- **Wallet Integration**:
  - [Interchain Kit](https://github.com/hyperweb-io/interchain-kit) - Cosmos wallets
  - [Wagmi](https://wagmi.sh/) - EVM wallets
- **Cross-Chain**: [Skip Protocol](https://skip.money/)
- **Chain Registry**: [@chain-registry/v2](https://github.com/hyperweb-io/chain-registry)
- **State Management**: React Hooks, TanStack Query

## 📜 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🌐 Supported Chains

### Cosmos Chains
- Noble (default destination for USDC)
- Osmosis
- Celestia
- Cosmos Hub
- And other Cosmos chains via Chain Registry

### EVM Chains
- Optimism (default source for USDC)
- Ethereum
- Polygon
- And other EVM chains supported by Wagmi

## 🔒 Security Notes

- **Development Mode**: The current implementation uses in-memory storage for bills. For production, use a proper database.
- **API Keys**: Never commit your Skip API key to version control. Use environment variables.
- **Wallet Security**: Always verify transaction details before signing.

## 🐛 Troubleshooting

### Wallet Connection Issues

- **Keplr not connecting**: Ensure Keplr extension is installed and unlocked
- **Metamask not connecting**: Ensure Metamask extension is installed and unlocked
- **Chain not found**: Make sure the chain is enabled in your wallet

### Payment Issues

- **Route calculation fails**: Verify your Skip API key is valid
- **Transaction fails**: Check you have sufficient balance for gas fees
- **Cross-chain swap fails**: Ensure both source and destination chains are supported

### Build Issues

- **Type errors**: Run `pnpm install` to ensure all dependencies are installed
- **Missing dependencies**: Check that `@chain-registry/v2-types` is installed

## 📝 Development Notes

- Bills are stored in-memory and will be lost on server restart (use a database in production)
- The app uses Skip Protocol for cross-chain routing and swaps
- Merchant receives payments on Noble chain in USDC
- Payments can be made from any supported Cosmos or EVM chain

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is provided "AS IS" without warranties of any kind. See the LICENSE file for details.

## 🙏 Credits

Built with the [Interchain JavaScript Stack](https://github.com/hyperweb-io):

- [Interchain Kit](https://github.com/hyperweb-io/interchain-kit) - Wallet connections
- [Interchain UI](https://github.com/hyperweb.io/interchain-ui) - UI components
- [Chain Registry](https://github.com/hyperweb-io/chain-registry) - Chain information
- [Skip Protocol](https://skip.money/) - Cross-chain infrastructure

## ⚠️ Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
