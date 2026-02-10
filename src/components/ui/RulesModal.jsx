import './RulesModal.css';

const RulesModal = ({ onClose, playSound }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card-8bit pixel-border" onClick={(e) => e.stopPropagation()}>
        <h2 className="title">📖 RULES & GUIDE</h2>

        <div className="rules-section pixel-border">
          <div className="rules-title">CEE-LO BASICS</div>
          <div className="rules-text">
            Roll 3 dice looking for specific combinations. Your goal is to defeat enemies through strategic dice rolls!
          </div>
        </div>

        <div className="rules-section pixel-border">
          <div className="rules-title">SCORING COMBINATIONS</div>
          <ul className="rules-list">
            <li><strong>🎉 4-5-6 INSTANT WIN:</strong> The best roll! You immediately win the round, no matter what. The round ends instantly!</li>
            <li><strong>⚡ TRIPS (e.g., 6-6-6):</strong> All three dice match. Deal massive damage equal to BASE DMG × trip value. Higher trips are better!</li>
            <li><strong>🎯 POINT (e.g., 4-5-5):</strong> Two dice match, one is different. The singleton is your "point." Deal BASE DMG × point value.</li>
            <li><strong>💀 1-2-3 INSTANT LOSS:</strong> The worst roll! You immediately lose the round. The round ends instantly - nothing can save you!</li>
            <li><strong>🔄 NO SCORE (e.g., 1-3-5):</strong> No matching dice and not 1-2-3 or 4-5-6. Both you and enemy automatically reroll FOR FREE until you get a valid combination. This does NOT use your manual rerolls!</li>
          </ul>
        </div>

        <div className="rules-section pixel-border">
          <div className="rules-title">TURN-BASED COMBAT</div>
          <ul className="rules-list">
            <li><strong>🎲 ENEMY TURN:</strong> Enemy rolls first and attacks! Their Trips/Points deal damage based on their roll (80% of your base damage).</li>
            <li><strong>🎲 YOUR TURN:</strong> Click "ROLL DICE" to roll your dice, then choose your action.</li>
            <li><strong>⚔️ ATTACK:</strong> Deal damage to the enemy. Trips and Points deal BASE DMG × value.</li>
            <li><strong>🛡️ DEFEND:</strong> Heal yourself. Trips heal 5× their value, Points heal 3× their value.</li>
            <li><strong>🔄 MANUAL REROLL:</strong> Don't like your valid roll? Use a manual reroll to try again. You start with 1 per round - buy more in the shop!</li>
            <li><strong>⚡ KEY STRATEGY:</strong> Enemy attacks every turn, so balance offense and defense carefully!</li>
          </ul>
        </div>

        <div className="rules-section pixel-border">
          <div className="rules-title">POWERUP GUIDE</div>
          <ul className="rules-list">
            <li><strong>🎲 LOADED DICE (25g):</strong> One die is permanently locked to 6. Makes trips easier and prevents 1-2-3!</li>
            <li><strong>💎 DOUBLE DOWN (30g):</strong> All trips deal 2× their normal damage. Combo with high trips!</li>
            <li><strong>📈 POINT BOOST (15g):</strong> Adds +1 to all your point values. Stackable!</li>
            <li><strong>🔄 EXTRA REROLL (12g):</strong> Adds +1 manual reroll per round. Stackable! Remember: "no score" rerolls are always free!</li>
            <li><strong>✨ ACE SAVER (35g):</strong> Once per round, turn 1-1-1 (worst trips) into 6-6-6 (best trips)!</li>
            <li><strong>🔄 GUARANTEED POINT (22g):</strong> Unlimited auto-rerolls. Never waste a turn!</li>
            <li><strong>🎰 HIGH ROLLER (40g):</strong> All dice always roll 4, 5, or 6. Prevents 1-2-3 entirely!</li>
            <li><strong>🍀 LUCKY CLOVER (30g):</strong> 15% chance per level to reroll low dice towards 4-5-6. Stackable!</li>
            <li><strong>🛡️ DEVIL'S WARD (30g):</strong> 20% chance per level to reroll a die to avoid 1-2-3. Stackable!</li>
            <li><strong>⚡ FIRST STRIKE (20g):</strong> Consumable item - use before a round to go first that round. Stackable!</li>
            <li><strong>🎯 WILD DIE (25g):</strong> Click a die to set its value once per round. Stackable!</li>
          </ul>
          <div className="rules-text" style={{ marginTop: '10px', fontSize: '7px', color: '#f39c12' }}>
            💡 PRICE SCALING: All items increase 2% per total purchase. Each powerup increases 50% when you buy it again (40% for stackables). You can buy multiples of everything!
          </div>
        </div>

        <div className="rules-section pixel-border">
          <div className="rules-title">STRATEGY TIPS</div>
          <ul className="rules-list">
            <li>CRITICAL: 1-2-3 = instant loss, 4-5-6 = instant win. Avoid the former at all costs!</li>
            <li>High Roller is now ESSENTIAL - it prevents 1-2-3 entirely by keeping all dice 4-6</li>
            <li>Loaded Dice also prevents 1-2-3 since one die is always 6</li>
            <li>Wild Die is your insurance policy - use it to avoid completing 1-2-3 combinations</li>
            <li>Combo: Loaded Dice + High Roller = Guaranteed 6-6-6 trips AND no risk of 1-2-3!</li>
            <li>Prices increase as you buy more - plan your build carefully!</li>
            <li>Later rounds give more gold and better rewards - but enemies get much tougher!</li>
          </ul>
        </div>

        <div className="rules-section pixel-border">
          <div className="rules-title">PROGRESSION</div>
          <div className="rules-text">
            Rewards scale up each round: Round 1 gives 20g, Round 2 gives 25g, etc. HP and damage bonuses also increase. However, enemy difficulty grows exponentially - later rounds have much tougher opponents! Powerup prices increase 5% with every purchase, and stackable powerups get 30% more expensive each time you buy them. Plan your economy wisely!
          </div>
        </div>

        <div className="action-buttons">
          <button className="button-8bit button-success" onClick={() => { playSound('click'); onClose(); }}>
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
